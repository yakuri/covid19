$(function(){

  // 感染数のグラフデータの初期化
  var chartDataKansen = {};
  chartDataKansen.type = 'bar';
  chartDataKansen.data = {
    labels: [{}],
    datasets: [
      {
        label: '感染数',
        data: [{}],
        backgroundColor: "rgba(219,39,91,0.5)",
      },
    ]
  };
  chartDataKansen.options = {
    title: {
      display: true,
      text: '都道府県別 感染数（上位10都道府県）'
    },
    scales: {
      xAxes: [{
          ticks: {
          }
      },],
      yAxes: [{
          ticks: {
          }
      },]
    },
  };

  // 死者数のグラフデータの初期化
  var chartDataShisha = {};
  chartDataShisha.type = 'bar';
  chartDataShisha.data = {
    labels: [{}],
    datasets: [
      {
        label: '死者数',
        data: [{}],
        backgroundColor: "rgba(100,39,91,0.5)",
      },
    ]
  };
  chartDataShisha.options = {
    title: {
      display: true,
      text: '都道府県別 死者数（上位10都道府県）'
    },
    scales: {
      xAxes: [{
          ticks: {
          }
      },],
      yAxes: [{
          ticks: {
          }
      },]
    },
  };

  // 感染数・死者数(現在)
  var dataKansenShisha;
  // 死者数(現在)
  var dataShisha;

  // 現在のデータを取得
  $.ajax({
    url:"https://covid19-japan-web-api.now.sh/api/v1/prefectures",
    type:"GET",
    dataType:"json",
    timespan:1000,
    async: false
    }).done(function(data,textStatus,jqXHR) {
      // 感染数(現在)
      dataKansenShisha = data;
      // 死者数(現在)
      dataShisha = data;
      for(var i in data){
        // 死者数の割合(現在)
        dataKansenShisha[i].parcent = 0;
        if(dataKansenShisha[i].cases != 0) {
          dataKansenShisha[i].parcent = Math.round(dataKansenShisha[i].deaths * 1000 / dataKansenShisha[i].cases) / 10;
        }
      }
      console.log(JSON.stringify(data));
    }).fail(function(jqXHR, textStatus, errorThrown ) {
      console.log(jqXHR.status);
      console.log(textStatus);
      console.log(errorThrown);
    }).always(function(){
      console.log("complete");
  });

  // 前日のデータを取得
  $.ajax({
    url:"https://yakuri.github.io/covid19/data/prefectures_20200411.json",
    type:"GET",
    dataType:"json",
    timespan:1000,
    async: false
    }).done(function(data,textStatus,jqXHR) {
      for(var i in data.data){
        // 感染数(前日)
        dataKansenShisha[i].casesYesterDay = data.data[i].cases;
        // 感染数(前日比)
        dataKansenShisha[i].casesDiff = dataKansenShisha[i].cases - dataKansenShisha[i].casesYesterDay ;
        // 死者数(前日)
        dataShisha[i].deathsYesterDay = data.data[i].deaths;
        // 死者数(前日比)
        dataShisha[i].deathsDiff = data.data[i].deaths;
      }
      console.log(JSON.stringify(data));
    }).fail(function(jqXHR, textStatus, errorThrown ) {
      console.log(jqXHR.status);
      console.log(textStatus);
      console.log(errorThrown);
    }).always(function(){
      console.log("complete");
  });

  // 現在の感染数でソート
  dataKansenShisha.sort(function(a,b){
    if(a.cases > b.cases) return -1;
    if(a.cases < b.cases) return 1;
    return 0;
  });

  // 感染数（死者数含む）の一覧表示
  displayList(dataKansenShisha);

  // 取得したデータを感染数のグラフデータに設定
  for(var i in dataKansenShisha){
    if (i < 10) {
      chartDataKansen.data.labels[i] = dataKansenShisha[i].name_ja;
      chartDataKansen.data.datasets[0].data[i] = dataKansenShisha[i].cases;
    }
  }

  // 現在の死者数でソート
  dataShisha.sort(function(a,b){
    if(a.deaths > b.deaths) return -1;
    if(a.deaths < b.deaths) return 1;
    return 0;
  });

  // 取得したデータを死者数のグラフデータに設定
  for(var i in dataShisha){
    // グラフ表示用
    if (i < 10) {
        chartDataShisha.data.labels[i] = dataShisha[i].name_ja;
        chartDataShisha.data.datasets[0].data[i] = dataShisha[i].deaths;
    }
  }

  // 感染数のグラフを表示
  var ctx = document.getElementById('chartKansen');
  var chart = new Chart(ctx, chartDataKansen);
  // 死者数のグラフを表示
  ctx = document.getElementById('chartShisha');
  var chart = new Chart(ctx, chartDataShisha);

});

// 一覧を表示
function displayList(dataKansenShisha) {
  $("#output").append("<tr><th>都道府県名</th><th>感染数(前日比)</th><th>死者数(前日比)</th><th>死者数の割合(前日比)</th></tr>");
  // 感染数
  var totalCases = 0;
  // 感染数前日比
  var totalCasesDiff = 0;
  // 死者数
  var totalDeaths = 0;
  // 死者数前日比
  var totalDeathsDiff = 0;

  for(var i in dataKansenShisha){
      // 昨日からの感染の増加数
      var casesDiff = dataKansenShisha[i].cases - dataKansenShisha[i].casesYesterDay;
      if(casesDiff >= 0) {
        casesDiff = "+" + casesDiff;
      } else {
        casesDiff = "-" + casesDiff;
      }
      // 昨日からの死者者の増加数
      var deathsDiff = dataKansenShisha[i].deaths - dataKansenShisha[i].deathsYesterDay;
      if(deathsDiff >= 0) {
        deathsDiff = "+" + deathsDiff;
      } else {
        deathsDiff = "-" + deathsDiff;
      }
      $("#output").append("<tr><td>"
        + dataKansenShisha[i].name_ja
        + "</td><td>"
        + dataKansenShisha[i].cases + "名"
        + "(" + casesDiff + ")"
        + "</td><td>"
        + dataKansenShisha[i].deaths + "名"
        + "(" + deathsDiff + ")"
        + "</td><td>"
        + dataKansenShisha[i].parcent + "%"
        + "</td></tr>");
        totalCases = totalCases + dataKansenShisha[i].cases;
        totalDeaths = totalDeaths + dataKansenShisha[i].deaths;
  }
  $("#output").append("<tr><td>計</td><td>" + totalCases
    + "名</td><td>" + totalDeaths
    + "名</td><td>" + Math.round(totalDeaths * 1000 / totalCases) / 10
    + "%</td></tr>");
}
