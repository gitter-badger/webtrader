/**
 * Created by arnab on 3/1/15.
 */

define(["jquery", "jquery-ui", 'color-picker', 'common/loadCSS'], function($) {

    function closeDialog() {
        $(this).dialog("close");
        $(this).find("*").removeClass('ui-state-error');
    }

    function init( containerIDWithHash, _callback ) {

        loadCSS('charts/indicators/sma/sma.css');

        $.get("charts/indicators/sma/sma.html" , function ( $html ) {

            var defaultStrokeColor = '#cd0a0a';

            $html = $($html);
            //$html.hide();
            $html.appendTo("body");
            //$html.find('select').selectmenu(); TODO for some reason, this does not work
            $html.find("input[type='button']").button();

            $html.find("#stroke").colorpicker({
                part:	{
                    map:		{ size: 128 },
                    bar:		{ size: 128 }
                },
                select:			function(event, color) {
                    $("#stroke").css({
                        background: '#' + color.formatted
                    }).val('');
                    defaultStrokeColor = '#' + color.formatted;
                },
                ok:             			function(event, color) {
                    $("#stroke").css({
                        background: '#' + color.formatted
                    }).val('');
                    defaultStrokeColor = '#' + color.formatted;
                }
            });

            $html.dialog({
                autoOpen: false,
                resizable: false,
                width: 280,
                buttons: [
                    {
                        text: "Ok",
                        click: function() {
                            //console.log('Ok button is clicked!');
                            require(["validation/validation"], function(validation) {

                                if (!validation.validateNumericBetween($html.find(".sma_input_width_for_period").val(),
                                                parseInt($html.find(".sma_input_width_for_period").attr("min")),
                                                parseInt($html.find(".sma_input_width_for_period").attr("max"))))
                                {
                                    require(["jquery", "jquery-growl"], function($) {
                                        $("#timePeriod").addClass('ui-state-error');
                                        $.growl.error({ message: "Only numbers between " + $html.find(".sma_input_width_for_period").attr("min")
                                                + " to " + $html.find(".sma_input_width_for_period").attr("max")
                                                + " is allowed for " + $html.find(".sma_input_width_for_period").closest('tr').find('td:first').text() + "!" });
                                    });
                                    return;
                                }

                                require(['charts/indicators/sma/highcharts_sma'], function ( ) {
                                    var options = {
                                        period : parseInt($html.find(".sma_input_width_for_period").val()),
                                        stroke : defaultStrokeColor,
                                        strokeWidth : parseInt($html.find("#strokeWidth").val()),
                                        dashStyle : $html.find("#dashStyle").val(),
                                        appliedTo: parseInt($html.find("#appliedTo").val())
                                    }
                                    //Add SMA for the main series
                                    $($(".sma").data('refererChartID')).highcharts().series[0].addSMA(options);
                                });

                                closeDialog.call($html);

                            });
                        }
                    },
                    {
                        text: "Cancel",
                        click: function() {
                            closeDialog.call(this);
                        }
                    }
                ]
            });

            if (typeof _callback == "function")
            {
                _callback( containerIDWithHash );
            }

        });

    }

    return {

        open : function ( containerIDWithHash ) {

            if ($(".sma").length == 0)
            {
                init( containerIDWithHash, this.open );
                return;
            }

            $(".sma").data('refererChartID', containerIDWithHash).dialog( "open" );

        }

    };

});
