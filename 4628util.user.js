// ==UserScript==
// @name           4628 Zangyo Request
// @namespace      https://github.com/kazsix
// @description    Automatically inputs to window
// @include        https://www.4628.jp/*
// @match          https://www.4628.jp/*
// ==/UserScript==

// a function that loads jQuery and calls a callback function when jQuery has finished loading
function addJQuery(callback) {
  var script = document.createElement("script");
  script.setAttribute("src", "https://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js");
  script.addEventListener('load', function() {
    var script = document.createElement("script");
    script.textContent = "(" + callback.toString() + ")();";
    document.body.appendChild(script);
  }, false);
  document.body.appendChild(script);
}


// the guts of this userscript
function main() {

  $(function() {
//  console.log(1);
//  console.log($("#header"));
//  console.log($("#header").size());
//  console.log($("#submit_form div table tbody tr td").html());

	var formId = $("input[name=application_form_master_id]").val();
	
	var customButtonHTML = '<div>\
								<input class="btn_custom" id="btn_custom_yesterday" type="button" value=" 昨日 ">\
								<input class="btn_custom" id="btn_custom_today" type="button" value=" 今日 " onclick="">\
							</div>';
	$("#submit_form table").eq(4).before(customButtonHTML);

	$(".btn_custom").bind("click", function(){
		if ($(this).attr("id") == "btn_custom_yesterday") {
			var targetDate = new Date();
			var targetDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() - 1);
		} else if ($(this).attr("id") == "btn_custom_today") {
			var targetDate = new Date();
		}
		changeDate(targetDate.getFullYear(),
					("0" + (targetDate.getMonth() + 1)).slice(-2),
					("0" + targetDate.getDate()).slice(-2));
	});

	// 時間外申請とタイムカード訂正のみ
	if (formId == "1" || formId == "4") {

		if ($("#reflect_date_select2").size() == 0) {
			// 申請項目(残業終了)追加
			$("input[name=scrollbody]").attr('value', getScrollPosition());
			$("input[name=action]").attr('value', 'editor');
			$("input[name=status]").attr('value', 'add,default');
			deleteUnnecessaryPostData();
			$("#submit_form").submit();
		}

		if (!$("#lbl_disp_reflect_date").attr("checked")) {
			// 計上日を表示
			$("#lbl_disp_reflect_date").trigger("click");
		}
		
		var today         = new Date();
		var yesterday     = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
		var defaultYear   = yesterday.getFullYear();
		var defaultMonth  = ("0" + (yesterday.getMonth() + 1)).slice(-2);
		var defaultDay    = ("0" + yesterday.getDate()).slice(-2);
		var defaultMinute = "00";

		if ($('.user_name').html().match(/東京/)) {
			// 東京タイム
			var defaultHourFrom = "19";
		} else {
			// 福岡タイム
			var defaultHourFrom = "18";
		}

		// 残業開始時間セット
		$('select[name=application_reflect_date_001_Year]').val(defaultYear);
		$('select[name=application_reflect_date_001_Month]').val(defaultMonth);
		$('select[name=application_reflect_date_001_Day]').val(defaultDay);
		$('select[name=value_date_001_Year]').val(defaultYear);
		$('select[name=value_date_001_Month]').val(defaultMonth);
		$('select[name=value_date_001_Day]').val(defaultDay);
		$('select[name=value_time_001_Hour]').val(defaultHourFrom);
		$('select[name=value_time_001_Minute]').val(defaultMinute);

		// 残業終了時間セット
		$('select[name=application_reflect_date_002_Year]').val(defaultYear);
		$('select[name=application_reflect_date_002_Month]').val(defaultMonth);
		$('select[name=application_reflect_date_002_Day]').val(defaultDay);
		$('select[name=reflect_item_id_002] option:last').attr("selected", "selected"); // 残業終了 or 退社
		$('select[name=value_date_002_Year]').val(defaultYear);
		$('select[name=value_date_002_Month]').val(defaultMonth);
		$('select[name=value_date_002_Day]').val(defaultDay);

		$('select[name=value_time_002_Hour]').focus();
	}

	// プルダウンの日付を一括変更
	function changeDate(y, m, d) {
	
		$('select').each(function(index) {
			console.log(index);
			if ($(this).attr("name").match(/Year/)) {
				$(this).val(y);
			}
			if ($(this).attr("name").match(/Month/)) {
				$(this).val(m);
			}
			if ($(this).attr("name").match(/Day/)) {
				$(this).val(d);
			}
		});
	}

  });
}

// load jQuery and execute the main function
addJQuery(main);

