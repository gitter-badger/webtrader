/**
 * Created by arnab on 3/1/15.
 */

define(["jquery", "datatables", "common/loadCSS"], function ($) {

    function _refreshInstruments( table, data, containerIDWithHash ) {

        $.each(data, function (key, value) {
            if (value.submarkets || value.instruments) {
                _refreshInstruments(table, value.submarkets || value.instruments, containerIDWithHash);
            }
            else {
                $(table.row.add([value.display_name]).node()).data(
                    {
                        "symbol": value.symbol,
                        "delay_amount": value.delay_amount
                    }).click(function () {

                        $(".overlay_dialog").dialog("close");
                        var symbol = $(this).data("symbol");
                        var delay_amount = $(this).data("delay_amount");
                        var displaySymbol = $(this).text();
                        var mainSeries_timeperiod = $(containerIDWithHash).data("timeperiod");
                        var type = $(containerIDWithHash).data("type");

                        //validate time period of the main series
                        require(["common/util"], function () {
                            if (isDataTypeClosePriceOnly(type)) {
                                var timeperiodObject = convertToTimeperiodObject(mainSeries_timeperiod);
                                if (delay_amount <= (timeperiodObject.timeInSeconds() / 60)) {
                                    require(['charts/chartOptions', "charts/charts"], function (chartOptions, charts) {
                                        $(containerIDWithHash).data("overlayIndicator", true);
                                        var newTabId = containerIDWithHash.replace("#", "").replace("_chart", "");
                                        if (chartOptions.isCurrentViewInLogScale(newTabId))
                                        {
                                            chartOptions.triggerToggleLogScale(newTabId);
                                        }
                                        chartOptions.disableEnableLogMenu( newTabId, false );
                                        chartOptions.disableEnableCandlestick( newTabId, false );
                                        chartOptions.disableEnableOHLC( newTabId, false );
                                        charts.overlay(containerIDWithHash, symbol, displaySymbol);
                                    });
                                } else {
                                    require(["jquery", "jquery-growl"], function ($) {
                                        $("#timePeriod").addClass('ui-state-error');
                                        $.growl.error({
                                            message: displaySymbol
                                            + " is not allowed to overlay on this chart!"
                                        });
                                    });
                                }
                            } else {
                                require(["jquery", "jquery-growl"], function ($) {
                                    $("#timePeriod").addClass('ui-state-error');
                                    $.growl.error({
                                        message: "Overlaying on " + type + " chart type is not allowed!"
                                    });
                                });
                            }
                        });
                    });
            }
        });

    }

    function refreshTable($html, instruments, containerIDWithHash) {

        //Clear what we already have
        $html.find('tbody tr').remove();

        var table = $html.find('table').DataTable();
        table.clear().draw();

        //Load market data
        _refreshInstruments(table, instruments.getMarketData(), containerIDWithHash);
        table.draw();

        $(".overlay_dialog").dialog( 'open' );
    }

    function init( containerIDWithHash, _callback ) {

        //validate if instruments menu has already been loaded or not
        require(["instruments/instruments"], function (instruments) {
            if ($.isEmptyObject(instruments.getMarketData())) {
                require(["jquery", "jquery-growl"], function ($) {
                    $.growl.error({message: "Market data is not loaded yet!"});
                });
            }
            else {

                loadCSS("//cdn.datatables.net/1.10.5/css/jquery.dataTables.min.css");
                loadCSS("lib/jquery/jquery-ui/colorpicker/jquery.colorpicker.css");
                loadCSS("overlay/overlay.css");

                $.get("overlay/overlay.html", function($html) {
                    $html = $($html);
                    $html.hide();
                    $html.appendTo("body");

                    //Init the scrollable and searchable table
                    $html.find('table').DataTable({
                        paging: false,
                        scrollY: 200,
                        info: false
                    });

                    $(".overlay_dialog").dialog({
                        autoOpen: false,
                        resizable: false,
                        buttons: []
                    });

                    refreshTable( $html, instruments, containerIDWithHash );
                });

            }
        });

    }

    return {

        openDialog : function( containerIDWithHash ) {

            //If it has not been initiated, then init it first
            if ($(".overlay_dialog").length == 0)
            {
                init( containerIDWithHash);
                return;
            }

            require(["instruments/instruments"], function (instruments) {
                refreshTable($(".overlay_dialog"), instruments, containerIDWithHash);
            });

        }

    };

});
