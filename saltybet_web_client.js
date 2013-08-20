// downloaded from view-source:http://www.saltybet.com/j/www-cdn-jtvnw-m.js

/* example of state.json:
{
  "p1name":"P. chunli",
  "p2name":"Sponge bob",
  "p1total":"0",
  "p2total":"0",
  "status":"open",
  "alert":null,
  "x":0
}

status values
    "open": betting is open
    "locked": betting is closed. game underway.
    "1": player 1 just won the game
    "2": player 2 just won the game

example of zdata.json can be found in zdata.json

*/

var betstate;
var x;
var p1n;
var p2n;
var p1te;
var p2te;
var p1to;
var p2to;
var alert;
var balance = $("#b").val();
var u = $("#u").val();
var _data;
$(document).ready(function () {
    $("#chatRadio").buttonset();
    $("button").button().click(function (event) {
        $("#sbettors1").toggle()
});
    $('input[type="submit"]').attr("disabled", "disabled")
});
var socket = io.connect("http://www-cdn-twitch.saltybet.com:8000");
socket.on("message", function (data) {
    try {
        $('input[type="submit"]').attr("disabled", "disabled");
        updateState()
    } catch (e) {
        console.log("invalid data");
        return
    }
});

function updateState() {
    $.ajax({
        type: "get",
        url: "../state.json",
        contentType: "application/json; charset=utf-8",
        data: "",
        dataType: "json",
        cache: "false",
        timeout: 30000,
        success: function (data) {
            betstate = data.status;
            x = data.x;
            p1n = data.p1name;
            p2n = data.p2name;
            p1te = data.p1total;
            p2te = data.p2total;
            p1to = parseInt(p1te.replace(/,/g, ""));
            p2to = parseInt(p2te.replace(/,/g, ""));
            alert = data.alert;
            $("#p1name").text(p1n);
            $("#p2name").text(p2n);
            $("#player1wager").text("$" + p1te || 0);
            $("#player2wager").text("$" + p2te || 0);
            if (!alert) {
                if (betstate == "open") {
                    $('input[type="submit"]').removeAttr("disabled");
                    $("#player1wager").hide().html('<img src="images/potload.gif" />').fadeIn("slow");
                    $("#player2wager").hide().html('<img src="images/potload.gif" />').fadeIn("slow");
                    $("#betstatus").hide().html('<span class="greentext">Bets are OPEN!</span>').fadeIn("slow");
                    $("#sbettorscount").html("");
                    $("#sbettors1").hide().html('<span class="redtext"><strong>' + p1n + '</strong></span><div id="bettors1"></div>').fadeIn("slow");
                    $("#sbettors2").hide().html('<span class="bluetext"><strong>' + p2n + '</strong></span><div id="bettors2"></div>').fadeIn("slow");
                    $("#wager").rules("add", {
                        max: balance
                    });
                    $("#odds").hide().html("N/A").fadeIn("slow")
                } else {
                    if (betstate == "locked") {
                        $('input[type="submit"]').attr("disabled", "disabled");
                        $("#betstatus").hide().html("Bets are locked until the next match.").fadeIn("slow")
                    } else {
                        $("#wager").val("");
                        betstate == "1" ? $("#betstatus").hide().html('<span class="redtext">' + p1n + " wins! Payouts to Team Red.</span>").fadeIn("slow") : $("#betstatus").hide().html('<span class="bluetext">' + p2n + " wins! Payouts to Team Blue.</span>").fadeIn("slow")
                    }
                }
            } else {
                $("#betstatus").hide().html(alert).fadeIn("slow")
            } if (x == 1) {
                updateData()
            }
        }
    })
}

function updateData() {
    $.ajax({
        type: "get",
        url: "../zdata.json",
        contentType: "application/json; charset=utf-8",
        data: "",
        dataType: "json",
        cache: "false",
        timeout: 20000,
        success: function (data) {
            if (betstate == "locked") {
                $("#lastbet").hide().html("N/A").fadeIn("slow");
                if (typeof data[u] != "undefined") {
                    lastWager = data[u]["w"];
                    lastPlayer = data[u]["p"];
                    if (p1to >= p2to) {
                        odds = ('<span class="redtext">' + (Math.round((p1to / p2to) * 10) / 10) + "</span>:1")
                    } else {
                        odds = ('1:<span class="bluetext">' + (Math.round((p2to / p1to) * 10) / 10) + "</span>")
                    }
                    payout = (data[u]["p"] == "1" ? ((lastWager / p1to) * p2to) : ((lastWager / p2to) * p1to));
                    payout = Math.ceil(payout);
                    $("#odds").html(odds + ' (<span class="greentext">$' + (payout || 0) + "</span>)");
                    (lastPlayer == "1" ? $("#lastbet").hide().html("$" + lastWager + ' on <span class="redtext">' + p1n + "</span>").fadeIn("slow") : $("#lastbet").hide().html("$" + lastWager + ' on <span class="bluetext">' + p2n + "</span>").fadeIn("slow"))
                }
                $("#sbettorscount").html("");
                $("#sbettors1").hide().html('<span class="redtext"><strong>' + p1n + '</strong></span><div id="bettors1"></div>').fadeIn("slow");
                $("#sbettors2").hide().html('<span class="bluetext"><strong>' + p2n + '</strong></span><div id="bettors2"></div>').fadeIn("slow");
                var bettors = [];
                var count = 0;
                var level;
                var mylevel;
                var levelimage;
                for (var p in data) {
                    bettors[+p] = data[p];
                    if (data[p] != null) {
                        if (data[p]["w"] != null) {
                            count++
                        }
                    }
                }
                bettors.sort(function (a, b) {
                    return parseFloat(b.w) - parseFloat(a.w)
                });
                $("#sbettorscount").html("Salty Bettors:<strong> " + count + "</strong><br/>");
                $.each(bettors, function (i, v) {
                    if (bettors[i] != null) {
                        levelimage = "";
                        level = bettors[i]["r"];
                        if (data[u] != null) {
                            if (data[u]["n"] == bettors[i]["n"]) {
                                mylevel = level
                            }
                        }
                        if (level > 0) {
                            levelimage = '<img src="../images/ranksmall/rank' + level + '.png" class="levelimage">'
                        }
                        if (bettors[i]["p"] == "1") {
                            $("#bettors1").append(levelimage + "<p><strong " + (bettors[i]["g"] == 1 ? 'class="goldtext"' : "") + ">" + bettors[i]["n"] + '</strong> <span class="redtext">-></span> <span class="greentext">$' + bettors[i]["w"] + "</span>  (&Sigma;$" + bettors[i]["b"] + ")</p>")
                        } else {
                            if (bettors[i]["p"] == "2") {
                                $("#bettors2").append(levelimage + "<p><strong " + (bettors[i]["g"] == 1 ? 'class="goldtext"' : "") + ">" + bettors[i]["n"] + '</strong> <span class="bluetext">-></span> <span class="greentext">$' + bettors[i]["w"] + "</span>  (&Sigma;$" + bettors[i]["b"] + ")</p>")
                            }
                        }
                    }
                })
            } else {
                if (typeof data[u] != "undefined") {
                    balance = data[u]["b"] || 0;
                    $("#balance").hide().html(balance).fadeIn("slow");
                    if (mylevel > 0) {
                        $("#rank").html('<img src="../images/ranksmall/rank' + mylevel + '.png" class="levelimage">')
                    }
                    $("#wager").rules("add", {
                        max: balance
                    })
                }
            }
        }
    })
}
$("input[type=submit]").click(function () {
    var selectedPlayer = $(this).attr("name");
    $("#selectedplayer").val(selectedPlayer);
    $("#lastbet").hide().html('<img src="../images/betload.gif">').fadeIn("slow")
});
$("#chatStream").click(function () {
    $("#chatframeSalty").hide();
    $("#chatframeStream").show()
});
$("#chatSalty").click(function () {
    $("#chatframeStream").hide();
    $("#chatframeSalty").show()
});
$("#chatOff").click(function () {
    $("#chatframeStream").hide();
    $("#chatframeSalty").hide()
});
$(function () {
    $("form").bind("submit", function () {
        if (betstate == "locked") {
            alert("Bets are locked.")
        } else {
            if (isNaN(Number($("#wager").val())) == true) {
                alert("Please enter a number.")
            } else {
                if (Number($("#wager").val()) > balance) {
                    alert("You don't have enough Salty Bucks.")
                } else {
                    $.ajax({
                        type: "post",
                        url: "../ajax_place_bet.php",
                        data: $("form").serialize(),
                        success: function () {
                            $('input[type="submit"]').attr("disabled", "disabled");
                            setTimeout(function () {
                                $('input[type="submit"]').removeAttr("disabled")
                            }, 3000)
                        }
                    });
                    return false
                }
            }
        }
    })
});
