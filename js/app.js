// init ScrollMagic Controller
var controller = new ScrollMagic.Controller();


// Map Handler
var scene2 = new ScrollMagic.Scene({
    triggerElement: "#pinned-trigger2", // point of execution
    duration: $(window).height(),// pin the element for a total of 400px
    triggerHook: 0,
    reverse: true // allows the effect to trigger when scrolled in the reverse direction
})
    .setPin("#pinned-element2") // the element we want to pin
    .addTo(controller);

// Map Handler
var scene3 = new ScrollMagic.Scene({
    triggerElement: "#pinned-trigger3", // point of execution
    duration: $(window).height(),// pin the element for a total of 400px
    triggerHook: 0,
    reverse: true // allows the effect to trigger when scrolled in the reverse direction
})
    .setPin("#pinned-element3") // the element we want to pin
    .addTo(controller);