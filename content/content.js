// define subtitle hider div
const $html = $("<div id='subtitle-hider' />");

window.onload = function(event){
    $html.draggable();
    $html.resizable({
    handles: "all",
    });
  $html.attr("mvclass", "core");
  $html.addClass("hidden");

  $("body").append($html);

  // observe body change
  const observer = new MutationObserver(function () {
    console.log("here");
    $html.attr("mvclass", "core");
  });
  observer.observe(document.body, {
    attributeFilter: ["mvclass"],
    attributes: true,
    subtree: false,
    childList: false,
  });
}

chrome.runtime.onMessage.addListener(({ show }) => toggleShow(show));

function toggleShow(show) {
  if (show) {
    $html.removeClass("hidden");
  } else {
    $html.addClass("hidden");
  }
}
