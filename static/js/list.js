function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function loadTotals() {
  $.get("./user/getTotalUsers", function (data) {
    $("#totalUsers").html(numberWithCommas(data["totalNotDeleted"]));// + " out of "+ numberWithCommas(data["total"]));
  });
  $.get("./hashtag/getTotalHashtags", function (data) {
    $("#totalHashtags").html(numberWithCommas(data["totalNotDeleted"]));// + " out of "+ numberWithCommas(data["total"]));
  });
  $.get("./link/getTotalLinks", function (data) {
    $("#totalLinks").html(numberWithCommas(data["totalNotDeleted"]));// + " out of "+ numberWithCommas(data["total"]));
  });
  $.get("./tweet/getTotalTweets", function (data) {
    $("#totalTweets").html(numberWithCommas(data["totalNotDeleted"]));// + " out of "+ numberWithCommas(data["total"]));
  });
}


$(document).ready(function () {
  Hashtag.init("divAnomalyHashtags");
  Link.init("divAnomalyLinks");
  Tweets.init("divAnomalyTweets");
  Users.init("divAnomalyUsers");
  loadTotals();
});