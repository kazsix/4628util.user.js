// ==UserScript==
// @name           4628 Utility Scripts
// @namespace      https://github.com/kazsix
// @description    日付の自動入力、カスタムボタンの追加など、4628システムの入力を支援
// @include        http://www.4628.jp/*
// @include        https://www.4628.jp/*
// @match          http://www.4628.jp/*
// @match          https://www.4628.jp/*
// ==/UserScript==

// a function that loads jQuery and calls a callback function when jQuery has finished loading
function addJQuery(callback) {
  var script = document.createElement("script");
  script.setAttribute("src", "https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js");
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

    // 出勤簿を開いた際に始業・就業時間をローカルストレージに保持させる
    if ($(".main_header").html() && $(".main_header").html().match(/\u51FA\u52E4\u7C3F/)) {

      if ($('.user_name').html().match(/\u6771\u4eac|\u4eac\u90fd/)) {
        if ($('#title_on0').html().match(/9\-18/)) {
          // 東京タイム(09:00-18:00)
          var defaultStartHour = "09";
          var defaultEndHour   = "18";
        } else {
          // 東京、京都タイム(10:00-19:00)
          var defaultStartHour = "10";
          var defaultEndHour   = "19";
        }
      } else {
        // 福岡タイム
        var defaultStartHour = "09";
        var defaultEndHour   = "18";
      }

      // ローカルストレージに保管
      window.localStorage.setItem("startHour", defaultStartHour);
      window.localStorage.setItem("endHour", defaultEndHour);
    }
    
    // 残業開始時間セット
    var defaultStartHour = window.localStorage.getItem("startHour");
    var defaultEndHour   = window.localStorage.getItem("endHour");

    if (defaultStartHour == null || defaultEndHour == null) {
      // ローカルストレージから取得できないため、地名のみで判定
      if ($('.user_name').html().match(/\u6771\u4eac|\u4eac\u90fd/)) {
        // 東京、京都タイム(10:00-19:00)
        var defaultStartHour = "10";
        var defaultEndHour   = "19";
      } else {
        // 福岡タイム
        var defaultStartHour = "09";
        var defaultEndHour   = "18";
      }
    }

    // 出勤簿
    if ($(".main_header").html() && $(".main_header").html().match(/\u51FA\u52E4\u7C3F/)) {
      var date = new Date();
      var nowYmd  = date.getFullYear() + ("0" + (date.getMonth() + 1)).slice(-2) + ("0" + date.getDate()).slice(-2);
      var dispYear = document.submit_form0.Date_Year.value;
      var dispMonth = document.submit_form0.Date_Month.value;
      
      $('tr[id^=fix]').each(function(index) {
        
        var loopDay  = $("td", this).eq(0).html();
        var loopYmd = dispYear + ("0" + dispMonth).slice(-2) + ("0" + loopDay).slice(-2);
        
        // 当日に色付け
        if (loopYmd == nowYmd) {
          $(this).css("background-color", "#E2FAC1");
        }
        // 未来日付は処理しない
        if (loopYmd > nowYmd) {
          return true;
        }
        // 平日以外は処理しない
        if ($("td", this).eq(2).html() != "\u5E73\u65E5") {
          return true;
        }
        var jyokyoKbn       = $("td", this).eq(5).html();
        var startTime       = $("td", this).eq(6).html();
        var endTime         = $("td", this).eq(7).html();
        var zangyoStartTime = $("td", this).eq(10).html();
        
        if (jyokyoKbn == "&nbsp;" && startTime > defaultStartHour + ":00") {
          $("td", this).eq(5).html('<a href="javascript:void(0);" class="link_custom" id="15">遅延</a>');
        }
        if (startTime == "&nbsp;") {
          $("td", this).eq(6).html('<a href="javascript:void(0);" class="link_custom" id="4">出勤</a>');
        }
        if (endTime == "&nbsp;") {
          $("td", this).eq(7).html('<a href="javascript:void(0);" class="link_custom" id="4">退勤</a>');
        }
        if (zangyoStartTime == "&nbsp;" && endTime > defaultEndHour + ":30") {
          $("td", this).eq(10).html('<a href="javascript:void(0);" class="link_custom" id="1">残業</a>');
        }
      })

      $(".link_custom").bind("click", function(){
        var day     = $("td", $(this).parent().parent()).eq(0).html();
        
        // 年月日をクエリストリングに追加
        var action = "./?year=" + dispYear
                     + "&month=" + dispMonth
                     + "&day=" + day;
        
        if ($(this).attr("id") == 1) {
          // 残業申請の場合、退社時間をクエリストリングに追加
          var endTime = $("td", $(this).parent().parent()).eq(7).html();
          if (endTime.match(/\d\d:\d\d/)) {
            endTime = endTime.split(':');
            action += "&end_hour=" + endTime[0]
                    + "&end_min=" + endTime[1];
          }
        }
        if ($(this).html().match(/\u9000\u52E4/)) {
          // 退勤申請の場合、フラグをクエリストリングに追加
          action += "&taikin=1";
        }
        document.submit_form0.action = action;
        addHidden("application_form_master_id", $(this).attr("id"), "submit_form0");
        addHidden("status", "default", "submit_form0");
        addHidden("start_date_Year", dispYear, "submit_form0");
        addHidden("start_date_Month", dispMonth - 1, "submit_form0");
        addHidden("start_date_Day", day, "submit_form0");
        addHidden("end_date_Year", dispYear, "submit_form0");
        addHidden("end_date_Month", dispMonth, "submit_form0");
        addHidden("end_date_Day", day, "submit_form0");
        document.submit_form0.module.value = "application_form";
        document.submit_form0.action.value = "editor";
        // 申請画面へ移動
        document.submit_form0.submit();
      });

      function addHidden(name, value, formname) {
        var q = document.createElement('input');
        q.type = 'hidden';
        q.name = name;
        q.value = value;
        document.forms[formname].appendChild(q);
      }
    }

    var formId = $("input[name=application_form_master_id]").val();

    // 申請画面
    if (formId) {

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

      // GETパラメータを配列で返す
      function getQueryString() {
        if (1 < document.location.search.length) {
          var query = document.location.search.substring(1);
          var parameters = query.split('&');
          var result = new Object();
          for (var i = 0; i < parameters.length; i++) {
            // パラメータ名とパラメータ値に分割する
            var element = parameters[i].split('=');
            var paramName = decodeURIComponent(element[0]);
            var paramValue = decodeURIComponent(element[1]);
            result[paramName] = decodeURIComponent(paramValue);
          }
          return result;
        }
        return "";
      }

      var customButtonHTML = '<div>\
                                  <input class="btn_custom" id="btn_custom_yesterday" type="button" value=" 昨日 ">\
                                  <input class="btn_custom" id="btn_custom_today" type="button" value=" 今日 ">\
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

      var get = getQueryString();
      if (get.year && get.month && get.day) {
        changeDate(get.year, get.month, get.day);
      }

      // 残業申請とタイムカード訂正の場合
      if (formId == "1" || formId == "4") {

        if (!$("#lbl_disp_reflect_date").attr("checked")) {
          // 計上日をデフォルト表示
          $("#lbl_disp_reflect_date").trigger("click");
          if (get.end_hour && get.end_min) {
            $("#submit_form").attr({action:"./?end_hour=" + get.end_hour + "&end_min=" + get.end_min});
          }
          if (formId == "1") {
            // 残業終了時間を追加(初回遷移時のみ)
            $("#submit_form input[value=追加]").trigger("click");
          }
        }

        if (formId == "4") {
          if (get.taikin == "1") {
            // 退社を選択
            $('select[name=reflect_item_id_001] option:last').attr("selected", "selected");
            // 退社時間をセット
            $('select[name=value_time_001_Hour]').val(defaultEndHour);
          } else {
            // 出社時間をセット
            $('select[name=value_time_001_Hour]').val(defaultStartHour);
          }
        }
        
        if (formId == "1") {
          // 残業終了を選択
          $('select[name=reflect_item_id_002] option:last').attr("selected", "selected");
          // 残業開始時間をセット
          $('select[name=value_time_001_Hour]').val(defaultEndHour);
          if (get.end_hour && get.end_min) {
            // 退勤時刻を残業終了時間にセット
            $('select[name=value_time_002_Hour]').val(get.end_hour);
            $('select[name=value_time_002_Minute]').val(get.end_min);
          }
        }
        
        $('select[name=value_time_001_Minute]').val("00");
        $('textarea[name=application_remarks]').focus();
      }
    }

  });
}

// load jQuery and execute the main function
addJQuery(main);

