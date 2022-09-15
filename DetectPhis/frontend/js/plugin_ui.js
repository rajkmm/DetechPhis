var background = chrome.extension.getBackgroundPage();
var colors = {
    "-1":"#58bc8a",
    "0":"#ffeb3c",
    "1":"#ff8b66"
};
var featureList = document.getElementById("features");

chrome.tabs.query({ currentWindow: true, active: true }, function(tabs){
    var result = background.results[tabs[0].id];
    var isPhish = background.isPhish[tabs[0].id];
    var legitimatePercent = background.legitimatePercents[tabs[0].id];

    for(var key in result){
        var newFeature = document.createElement("li");
        //console.log(key);
        newFeature.textContent = key;
        //newFeature.className = "rounded";
        newFeature.style.backgroundColor=colors[result[key]];
        featureList.appendChild(newFeature);
    }
    
    $("#site_score").text(parseInt(legitimatePercent)+"%");
    if(isPhish) {
        $("#res-circle").css("background", "#ff8b66");
        $("#site_msg").text("Warning!! You're being phished.");
        $("#site_score").text(parseInt(legitimatePercent)-20+"%");
    }
    /**
 * highlight/select text
 * @param element
 */
function SelectText(element) {

  var doc = document,
    text = doc.getElementById(element),
    range, selection;

  if (doc.body.createTextRange) {

    range = document.body.createTextRange();
    range.moveToElementText(text);
    range.select();

  } else if (window.getSelection) {

    selection = window.getSelection();
    range = document.createRange();
    range.selectNodeContents(text);
    selection.removeAllRanges();
    selection.addRange(range);

  }

}

/**
 * fetch ip information
 */
async function fetchIp(host) {
  return await new Promise(async function (presp, preject) {
    var r = new XMLHttpRequest();
    r.open("GET", host, true);
    r.onreadystatechange = function () {
      if (r.readyState !== 4 || r.status !== 200) return;
      presp(r.responseText);
    };
    r.send();
  });
}

/**
 * fetch dns
 */
async function fetchDns(host) {
  return await new Promise(async function (presp, preject) {
    var r = new XMLHttpRequest();
    r.open("GET", host, true);
    r.onreadystatechange = function () {
      if (r.readyState !== 4 || r.status !== 200) return;
      presp(r.responseText);
    };
    r.send();
  });
}

/**
 * select text handler
 * @param e Element
 */
document.onclick = function (e) {
  if (e.target.className === 'click') {
    SelectText('remoteIP');
  }
};

window.onload = async function () {
  // -- var
  var host_ipapi = "http://ip-api.com/json";
  var host_dns = "http://edns.ip-api.com/json";

  // fetch data
  var result_ip = await fetchIp(host_ipapi);
  var result_dns = await fetchDns(host_dns);

  if (result_dns && result_ip) {
    document.getElementById("img-loading").style.display = 'none';
    document.getElementById("show-ip").style.display = 'inherit';
    document.getElementById("show-more").style.display = 'inherit';
  }

  // json parse
  var ip_object = JSON.parse(result_ip);
  var dns_object = JSON.parse(result_dns);

  // data object
  var information = new Object({
    remoteCountry: (typeof ip_object.country !== "undefined") ? ip_object.country : "unknown",
    regionName: (typeof ip_object.regionName !== "undefined") ? ip_object.regionName : "unknown",
    region: (typeof ip_object.region !== "undefined") ? ip_object.region : "unknown",
    countryCode: (typeof ip_object.countryCode !== "undefined") ? ip_object.countryCode : "unknown",
    remoteZip: (typeof ip_object.zip !== "undefined") ? ip_object.zip : "unknown",
    remoteCity: (typeof ip_object.city !== "undefined") ? ip_object.city : "unknown",
    timezone: (typeof ip_object.timezone !== "undefined") ? ip_object.timezone : "unknown",
    isp: (typeof ip_object.isp !== "undefined") ? ip_object.isp : "unknown",
    query: (typeof ip_object.query !== "undefined") ? ip_object.query : "unknown",
    dns_ip: (typeof dns_object.dns.ip !== "undefined") ? dns_object.dns.ip : "unknown",
    dns_geo: (typeof dns_object.dns.geo !== "undefined") ? dns_object.dns.geo : "unknown",
  });

  // add data into document
  document.getElementById("remoteCountry").innerHTML = information.remoteCountry + " (" + information.countryCode + ")";
  document.getElementById("remoteRegion").innerHTML = information.regionName + " (" + information.region + ")";
  // document.getElementById("remoteCity").innerHTML = information.remoteCity + " " + information.remoteZip;
  document.getElementById("remoteTimezone").innerHTML = information.timezone;
  document.getElementById("remoteIsp").innerHTML = information.isp;
  document.getElementById("remoteIP").innerHTML = information.query;
  document.getElementById("remoteDNS_IP").innerHTML = information.dns_ip;
  document.getElementById("remoteDNS").innerHTML = information.dns_geo;

};
});

