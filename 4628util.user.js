// ==UserScript==
// @name           4628 Utility Scripts
// @namespace      https://github.com/kazsix
// @description    日付の自動入力、カスタムボタンの追加など、4628システムの入力を支援
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

    var formId = $("input[name=application_form_master_id]").val();

    var customButtonHTML = '<div>\
                                <input class="btn_custom" id="btn_custom_yesterday" type="button" value=" 昨日 ">\
                                <input class="btn_custom" id="btn_custom_today" type="button" value=" 今日 " onclick="">\
                            </div>';
    $("#submit_form table").eq(4).before(customButtonHTML);

    $(".btn_custom").bind("click", function(){
      var date = new Date();
      if ($(this).attr("id") == "btn_custom_yesterday") {
        changeDate(date.getFullYear(), date.getMonth() + 1, date.getDate() - 1);
      } else if ($(this).attr("id") == "btn_custom_today") {
        changeDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
      }
    });

    // 時間外申請とタイムカード訂正の場合
    if (formId == "1" || formId == "4") {

      if (document.referrer.match(/action=application_form/)) {
        // 残業終了 or 退社の項目を追加(初回遷移時のみ)
        $("#submit_form input[value=追加]").trigger("click");
      }

      if (!$("#lbl_disp_reflect_date").attr("checked")) {
        // 計上日をデフォルト表示
        $("#lbl_disp_reflect_date").trigger("click");
      }
    
      // 残業開始時間セット
      if ($('.user_name').html().match(/東京|京都/)) {
        // 東京、京都タイム
        var defaultHourFrom = "19";
      } else {
        // 福岡タイム
        var defaultHourFrom = "18";
      }
      var defaultMinute = "00";

      $('select[name=value_time_001_Hour]').val(defaultHourFrom);
      $('select[name=value_time_001_Minute]').val(defaultMinute);

      // 申請内容(残業終了 or 退社)セット
      $('select[name=reflect_item_id_002] option:last').attr("selected", "selected"); // 残業終了 or 退社

      $('select[name=value_time_002_Hour]').focus();
    }

    // プルダウンの日付を一括変更
    function changeDate(y, m, d) {
      
      m = ("0" + m).slice(-2);
      d = ("0" + d).slice(-2);
      
      $('select').each(function(index) {
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

