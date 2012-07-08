loader.addFinishHandler(function() {

    GM_log(" - define bos.Const");

    qx.Class.define("bos.Const", {
        statics:{
            DEBUG_VERSION:true,

            TRADE_TRANSPORT_CART:1,
            TRADE_TRANSPORT_SHIP:2,
            TRADE_TRANSPORT_CART_FIRST:3,
            TRADE_TRANSPORT_SHIP_FIRST:4,

            CART_CAPACITY:1000,
            SHIP_CAPACITY:10000,

            TRADE_STATE_TRANSPORT:1,
            TRADE_STATE_RETURN:2,

            GOLD:0,
            WOOD:1,
            STONE:2,
            IRON:3,
            FOOD:4,

            ORDER_ATTACK:0,
            ORDER_DEFEND:1,
            ORDER_SUPPORT:2,

            MOONSTONE_COST:1000,

            TABLE_SUMMARY_ROW_BORDER:"2px solid #E8D3AE",
            TABLE_BORDER:"1px dotted rgb(77, 79, 70)",
            TABLE_DEFAULT_COLOR:"#F3D298",
            RESOURCE_GREEN:"#40C849",
            RESOURCE_YELLOW:"#FFE400",
            RESOURCE_RED:"#FF0000",

            INF:1000000000,

            REGION_CITY:0,
            REGION_CASTLE:1,
            REGION_LAWLESS_CITY:2,
            REGION_LAWLESS_CASTLE:3,
            REGION_RUINS:4,
            REGION_UNKNOWN:5,

            EXTRA_WIDE_OVERLAY:999,

            FAKE_ATTACK_TS:4000,

            //flood control
            MIN_SEND_COMMAND_INTERVAL:500,

            //server periodically sends new data with new resource levels, updated city orders
            // -> it causes summary to refresh but better not to refresh if very recently there was another refresh
            MIN_INTERVAL_BETWEEN_AUTO_REFRESHES:5000,

            MAX_POPUPS:10
        }
    })

});