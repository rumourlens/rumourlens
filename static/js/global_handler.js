let ALPHA_MAX = -1;

const GlobalHandler = new function () {
    this.changeAlphaMax = () => {
        const alpha = $('#txtAlphaMax').val();
        ALPHA_MAX = alpha;
        Tweets.rerender();
        Users.rerender();
        Hashtag.rerender();
        Link.rerender();
        RumourGraph.init(true);
    }
};