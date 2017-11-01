var database = firebase.database();
var databaseRef = firebase.database().ref('list/');	//list 참조
var userEmail;	//사용자 이메일
var userId;	//사용자 고유 아이디
var articleNum; //클립 갯수
var articleKey;	//클립 고유키

firebase.auth().onAuthStateChanged(function(user) {
	if(user){
		userEmail = user.email;
		userId = user.uid;
		
		fnHideModal();	//메뉴 모달 숨기기
		fnLinkLoad(user.uid); //사용자 고유의 아이디를 사용한다.
	}
});

/******************************* LINK LOAD *******************************/
//해당 유저의 모든 클립 출력
function fnLinkLoad(userID){

	articleNum = 0;	//클립 갯수
	$(".link_list").empty();	//link_list 내의 내용 삭제
	
	databaseRef.child(userID).on('value', snapshot => {
		snapshot.forEach(function(childSnapshot){
			
			if(childSnapshot.val().bookMark == 'Y'){	
				++articleNum;	//링크 갯수 추가
			
				var articleText = "";
				var fnClickText = "onclick='fnLinkClick(" + '"' + childSnapshot.val().url + '"' + ");'";
				var fnMenuText = "onclick='fnMenuClick(" + '"' + childSnapshot.key + '"' + ");'";

				articleText += "<div class='article'>";
				articleText += "<a href='#'><div class='img_thumb'" + fnClickText + "></div></a>";
				
				articleText += "<div class='content'>";
				articleText += "<a href='#'> <h2 class='title_article'"; 
				articleText += "id='title_article" + articleNum + "' " + fnClickText + ">";
				articleText	+= childSnapshot.val().title + "<h2></a>";
				
				articleText += "<a href='#'><p class='content_article'"; 
				articleText += "id='content_article" + articleNum + "'" + fnClickText + ">";
				articleText += childSnapshot.val().description + "</p></a>";
				
				articleText += "<div class='source_area'>";
				articleText += "<span class='date_article' id='date_article" + articleNum + "'>";
				articleText += childSnapshot.val().savedDate + "</span>";
				articleText += "<span class='addr_article' id='addr_article" + articleNum + "'>";
				articleText += childSnapshot.val().url + "</span></div>";
				
				articleText += "<span class='btn_menu'><a href='#' " + fnMenuText + ">";
				articleText += "<img src='images/btn_menu.png' alt=''></a></span>";
				
				articleText += "<span class='chk_list'><a href='#'>";
				articleText += "<img id='imgChk" + articleNum + "' class='bookmark' src='images/chk_list_select.png' alt=''";
				articleText += "onclick='fnLinkCheck(" + '"' + childSnapshot.key + '"' + ',"' + articleNum + '"' + ");'>";	
				articleText += "</a></span></div></div>";
			
				$(".link_list").append(articleText);	//링크목록에 추가
			}
		})
		$(".container").css('display','none');	//로딩 지우기
		$(".link_list").slideDown();	//링크 보이기	
	});
}

//링크 클릭시 이벤트
function fnLinkClick(url){

	//즐겨찾기 버튼을 클릭했다면 이벤트 무효화
/*	if($('.chk_list').hasClass('clicked')){
		$('.chk_list').removeClass("clicked");
	}
	else{
	//링크 클릭시 해당 링크로 이동
		location.href = url;
	}*/
	location.href = url;
}

/***************************** BOOKMARK LINK *****************************/
//즐겨찾기 클릭시 이벤트
function fnLinkCheck(key, articleId){

	//링크 버튼 클릭과 즐겨찾기 버튼 클릭 구분
	//$('.chk_list').addClass("clicked");
	
	//각 북마크의 고유 아이디
	var imgChkId = "#imgChk" + articleId;
	
	//즐겨찾기된 링크일 경우, 즐겨찾기 해제
	if($(imgChkId).hasClass('bookmark')){
	
		$(imgChkId).attr('src', 'images/chk_list.png');
		$(imgChkId).removeClass("bookmark");
		
		var data = {};	
		databaseRef.child(userId).child(key).on('value', snapshot => {
			
			data = {
				bookMark : 'N',
				description : snapshot.val().description,
				fname : snapshot.val().fname,
				savedDate : snapshot.val().savedDate,
				title : snapshot.val().title,
				url : snapshot.val().url
			}			
		});
		
		var updates = {};
		updates['/list/' + userId + '/' + key] = data;
		firebase.database().ref().update(updates);
	}
	//링크 재출력
	fnLinkLoad(userId);
}

/******************************* MENU MODAL *******************************/
//메뉴 모달 숨기기
function fnHideModal(){
	window.onclick = function(event) {
		if (event.target == modal) {
			modal.style.display = "none";
		}
	}
}

//메뉴 모달 닫기
function fnCloseModal(){
	$("#modal").css('display','none');
	$("#remove_link").unbind("click");
}

/******************************* LINK EDIT *******************************/
//수정 모달 닫기
function fnCloseEditModal(){
	$("#edit_modal").css('display','none');
	$("#remove_link").unbind("click");
}

//폴더변경 모달 닫기
function fnCloseFolderModal(){
	$("#folder_modal").css('display','none');
	$("#remove_link").unbind("click");
}

//링크 삭제 & 수정 & 폴더변경 처리
function fnMenuClick(key){
	
	articleKey = key;
	
	//모달 보이기
	$("#modal").css('display','block');
	
	//링크 삭제
	$("#remove_link").on('click', function(){
	
		var isDelOk = confirm("해당 링크를 삭제하시겠어요?\n삭제 시 영구 삭제됩니다.");

		if(isDelOk == false){
			//메뉴 모달 닫기
			$("#modal").css('display','none');
			//삭제 이벤트 무효화
			$("#remove_link").unbind("click");
			//return false;
		}
		else{
			//삭제
			firebase.database().ref().child('/list/' + userId + '/' + key).remove();
			//메뉴 모달 닫기
			$("#modal").css('display','none');
			//삭제 이벤트 무효화
			$("#remove_link").unbind("click");
			//링크 재출력
			fnLinkLoad(userId);
		}
	});
	
	//링크 수정 모달 열기
	$("#edit_link").on('click', function() {
	
		//메뉴 모달 닫기
		$("#modal").css('display','none');
		
		databaseRef.child(userId).child(key).on('value', function(snapshot){
			
			$("#title_edit").val(snapshot.val().title);
			$("#content_edit").val(snapshot.val().description);
		});
		
		//수정 모달 열기
		$("#edit_modal").css('display','block');
	});
	
	//폴더에 링크 추가/변경
	$("#folder_link").on('click', function(){
		
		//메뉴 모달 닫기
		$("#modal").css('display','none');
		//폴더변경 모달 열기
		$("#folder_modal").css('display','block');
	});
}

//링크 수정
function fnLinkEdit(){
	
	var editTitle = $("#title_edit").val();
	var editContent = $("#content_edit").val();
	
	var data = {};
	databaseRef.child(userId).child(articleKey).on('value', snapshot => {

		data = {
				bookMark : snapshot.val().bookMark,
				description : editContent,
				fname : snapshot.val().fname,
				savedDate : snapshot.val().savedDate,
				title : editTitle,
				url : snapshot.val().url
			}
	});

	var updates = {};
	updates['/list/' + userId + '/' + articleKey] = data;
	firebase.database().ref().update(updates);
	
	//수정 모달 닫기
	$("#edit_modal").css('display','none');
	//메뉴 모달 닫기
	$("#modal").css('display','none');
	//링크 고유키 초기화
	articleKey = null;
	//링크 재출력
	fnLinkLoad(userId);
}

//링크 폴더추가/변경
function fnLinkFolder(){
	
	/*
	
	코드 넣기
	
	*/
	
	//폴더변경 모달 닫기
	$("#folder_modal").css('display','none');
	//메뉴 모달 닫기
	$("#modal").css('display','none');
	//링크 고유키 초기화
	articleKey = null;
	//링크 재출력
	fnLinkLoad(userId);
}

/****************************** LINK SEARCH ******************************/
//링크 검색 보이기
function fnShowSearch(){

	var $show = $(".searchTxt").css('display');
	
	if($show == 'none'){
		$(".top_menu > h1").hide();
		$(".searchTxt").val('').fadeIn();
	}
	else{
		$(".top_menu > h1").fadeIn();
		$(".searchTxt").hide();
		fnLinkLoad(userId);
	}
}

//링크 검색 커서
function fnKeyUpSearch(){

	var txt = $(".searchTxt").val();

	if(txt == ""){
		$(".list_search").empty();	//검색결과 지우기
		fnLinkLoad(userId);
	}
	else{
		fnLinkSearch(userId, txt);
	}
}

//링크 검색
function fnLinkSearch(userID, txt){

	var searchText = "";
	var resultText = "";	//검색결과 텍스트
	
	articleNum = 0;
	$(".link_list").empty();
	$(".list_search").empty();	//검색결과 지우기

	databaseRef.child(userID).on('value',function(snapshot){
		snapshot.forEach(function(childSnapshot){
			if((childSnapshot.val().title.indexOf(txt) != -1) && (childSnapshot.val().bookMark == 'Y')){

				++articleNum;	//링크 갯수 추가

				var fnClickText = "onclick='fnLinkClick(" + '"' + childSnapshot.val().url + '"' + ");'";
				var fnMenuText = "onclick='fnMenuClick(" + '"' + childSnapshot.key + '"' + ");'";

				searchText += "<div class='article'>";
				searchText += "<a href='#'><div class='img_thumb'" + fnClickText + "></div></a>";

				searchText += "<div class='content'>";
				searchText += "<a href='#'> <h2 class='title_article'";
				searchText += "id='title_article" + articleNum + "' " + fnClickText + ">";
				searchText	+= childSnapshot.val().title + "<h2></a>";

				searchText += "<a href='#'><p class='content_article'";
				searchText += "id='content_article" + articleNum + "'" + fnClickText + ">";
				searchText += childSnapshot.val().description + "</p></a>";

				searchText += "<div class='source_area'>";
				searchText += "<span class='date_article' id='date_article" + articleNum + "'>";
				searchText += childSnapshot.val().savedDate + "</span>";
				searchText += "<span class='addr_article' id='addr_article" + articleNum + "'>";
				searchText += childSnapshot.val().url + "</span></div>";
				
				searchText += "<span class='btn_menu'><a href='#' " + fnMenuText + ">";
				searchText += "<img src='images/btn_menu.png' alt=''></a></span>";

				if(childSnapshot.val().bookMark == 'N'){
					searchText += "<span class='chk_list'><a href='#'>";
					searchText += "<img id='imgChk" + articleNum + "' src='images/chk_list.png' alt=''";
				}
				else{
					searchText += "<span class='chk_list'><a href='#'>";
					searchText += "<img id='imgChk" + articleNum + "' class='bookmark' src='images/chk_list_select.png' alt=''";
				}
		
				searchText += "onclick='fnLinkCheck(" + '"' + childSnapshot.key + '"' + ',"' + articleNum + '"' + ");'>";
				searchText += "</a></span></div></div>";
			}
		});
		$(".link_list").append(searchText);
		//검색결과창
		resultText = "'" + txt + "' 검색결과 " + articleNum + "개";	
		$(".list_search").text(resultText);
		$(".search_container").css('display', 'block');
	});
}