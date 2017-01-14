function openModal (itemDom) {
    var title = itemDom.find(".item-title").text().trim();
    var image = itemDom.find(".item-image").data('img-url').trim();
    console.log(itemDom.find(".full-description"));
    var description = itemDom.find(".full-description").html().trim();

    $(".product-modal-title").html(title);
    $(".product-modal-image").attr('src', image);
    $(".product-modal-description").html(description);

    $("#myModal").modal();
}

$(function () {
    $(document).on('click', ".product-item", function (e) {
        e.preventDefault();
        // openModal($(this));
    });

    $('#myModal').on('hidden.bs.modal', function (e) {
        var scr = document.body.scrollTop;
        window.location.href = '#';
        document.body.scrollTop = scr;
    });

    var hash = window.location.hash;
    hash = hash.replace('#', '');
    if (typeof isProducts !== 'undefined' && hash.indexOf(':') !== -1) {
        var hashPieces = hash.split(':');

        var sectionDom = $("[data-key='" + hashPieces[0] + "']");
        var itemDom = sectionDom.find("[data-item-key='" + hashPieces[1] + "']");
        openModal(itemDom);
    }
});
