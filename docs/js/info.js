$.ajax({
  url:"https://covid19-japan-web-api.now.sh/api/v1/prefectures",
  type:"GET",
  dataType:"json",
  timespan:1000
  }).done(function(data1,textStatus,jqXHR) {
    $("#output").append("<tr><th>県名</th><th>感染数</th><th>死者数</th></tr>");
    var totalcases = 0;
    var totaldeaths = 0;
    for(var i in data1){
        $("#output").append("<tr><td>" + data1[i].name_ja
          + "</td><td>" + data1[i].cases
          + "名</td><td>" + data1[i].deaths
          + "名</td></tr>");
          totalcases = totalcases + data1[i].cases;
          totaldeaths = totaldeaths + data1[i].deaths;
    }
    $("#output").append("<tr><td>計</td><td>" + totalcases
      + "名</td><td>" + totaldeaths
      + "名</td></tr>");
    var data2 = JSON.stringify(data1);
    console.log(data2);
  }).fail(function(jqXHR, textStatus, errorThrown ) {
    console.log(jqXHR.status);
    console.log(textStatus);
    console.log(errorThrown);
  }).always(function(){
    console.log("complete");
});
