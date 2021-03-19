function selectTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tab-main-content");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    activedTabs = document.getElementsByClassName(tabName);
    for (i = 0; i < activedTabs.length; i++) {
        activedTabs[i].style.display = "block";
    }
    evt.currentTarget.className += " active";
}

function selectSubTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabsubcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tab-sub-content");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    activedTabs = document.getElementsByClassName(tabName);
    for (i = 0; i < activedTabs.length; i++) {
        activedTabs[i].style.display = "block";
    }
    evt.currentTarget.className += " active";
}

$(document).ready(function () {
    document.getElementById("mainTabDefault").click();
});