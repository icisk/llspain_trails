import {useIntl, useService} from "open-pioneer:react-hooks";


export const espanolChartOptions = (intl)=> ({
    lang: {
        // Basic Date/Time Names
        months: [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio',
            'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ],
        shortMonths: [
            'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul',
            'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
        ],
        weekdays: [
            'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
        ],

        // Other common texts you might want to translate
        loading: 'Cargando...',
        contextButtonTitle: 'Menú contextual del gráfico',
        downloadJPEG: 'Descargar imagen JPEG',
        downloadPDF: 'Descargar documento PDF',
        downloadPNG: 'Descargar imagen PNG',
        downloadSVG: 'Descargar imagen vectorial SVG',
        printChart: 'Imprimir gráfico',
        resetZoom: 'Restablecer zoom',
        resetZoomTitle: 'Restablecer nivel de zoom 1:1',
        thousandsSep: '.', // Often '.' for thousands in Spanish
        decimalPoint: ','   // Often ',' for decimal point in Spanish
        // Add any other lang options you need from the Highcharts API documentation
    }
});

export const CS02_initChartOptions =(intl) => ({
    chart: { type: "column", zoomType: "x" },
    title: { text: intl.formatMessage({ id: "global.plot.header_temp_precip" }) },
    xAxis: {
        title: { text: intl.formatMessage({ id: "global.vars.date" }) }
    },
    yAxis: [
        {
            title: { text: intl.formatMessage({ id: "global.vars.precip" }) + " (mm)" },
            min: 0,
            max: 400,
            opposite: false,
        },
        {
            title: { text: intl.formatMessage({ id: "global.vars.temp" }) + " (°C)" },
            min: -10,
            max: 40,
            opposite: true,
        }
    ],
    tooltip: { valueDecimals: 1 },
    series: [
        {
            name: intl.formatMessage({ id: "global.vars.precip" }),
            data: new Array(12).fill(null),
            type: "column",
            color: "blue",
            yAxis: 0,
            showInLegend: false
        },
        {
            name: intl.formatMessage({ id: "global.vars.temp" }),
            data: new Array(12).fill(null),
            type: "line",
            color: "orange",
            yAxis: 1,
            marker: { symbol: "circle" },
            lineWith: 0,
            showInLegend: false
        }
    ]
});


export const CS02_compareChartOptions =(
                                        intl, 
                                        months, 
                                        yearLeft, 
                                        yearRight,
                                        tempData1,
                                        tempData2,
                                        precipData1,
                                        precipData2) => ({
    chart: { type: "column", zoomType: "x" },
    title: { text: intl.formatMessage({ id: "global.plot.header_temp_precip" }) },
    xAxis: { type: 'categories',
        title: { text: intl.formatMessage({ id: "global.vars.date" }) },
        categories: months,
        min: null,
        max: null},
    yAxis: [
        {
            title: { text: intl.formatMessage({ id: "global.vars.precip" }) + " (mm)" },
            min: 0,
            max: 400,
            opposite: false,
        },
        {
            title: { text: intl.formatMessage({ id: "global.vars.temp" }) + " (°C)" },
            min: -10,
            max: 40,
            opposite: true,
        }
    ],
    tooltip: { valueDecimals: 1,
        shared: true,
    },
    series: [
        {
            name: `${yearLeft} ${intl.formatMessage({ id: "global.vars.precip" })}`,
            data: precipData1,
            type: "column",
            color: "blue",
            yAxis: 0,
            showInLegend: true
        },
        {
            name: `${yearRight} ${intl.formatMessage({ id: "global.vars.precip" })}`,
            data: precipData2,
            type: "column",
            color: "lightblue",
            yAxis: 0,
            showInLegend: true
        },
        {
            name: `${yearLeft} ${intl.formatMessage({ id: "global.vars.temp" })}`,
            data: tempData1,
            type: "line",
            color: "orange",
            yAxis: 1,
            marker: { symbol: "circle" },
            lineWith: 0,
            showInLegend: true
        },
        {
            name: `${yearRight} ${intl.formatMessage({ id: "global.vars.temp" })}`,
            data: tempData2,
            type: "line",
            color: "red",
            yAxis: 1,
            marker: { symbol: "circle" },
            lineWith: 0,
            showInLegend: true
        }
    ]
});

export const CS02_TPfullTimeSeriesChartOptions =(
        intl,
        precipTSDATA,
        tempTSDATA,
            ) => ({
    chart: { type: "column", zoomType: "x" },
    title: { text: intl.formatMessage({ id: "global.plot.header_temp_precip" }) },
    xAxis: { type: 'datetime',
        title: {text: intl.formatMessage({ id: "global.vars.date" })},
        categories: undefined,
        min: null,
        max: null},
    yAxis: [
        {title: {text: intl.formatMessage({ id: "global.vars.precip" }) + " (mm)" }, min: 0, max: 400, opposite: false},
        {title: {text: intl.formatMessage({ id: "global.vars.temp" }) + " (°C)" }, min: -10, max: 40, opposite: true}
    ],
    tooltip: {
        valueDecimals: 1,
        xDateFormat: '%Y-%m-%d',
    },
    series: [
        {
            name: intl.formatMessage({ id: "global.vars.precip" }),
            data: precipTSDATA || [],
            type: "column",
            color: "blue",
            yAxis: 0
        },
        {
            name: intl.formatMessage({ id: "global.vars.temp" }),
            data: tempTSDATA || [],
            type: "spline",
            color: "orange",
            yAxis: 1
        },
    ]
});

export const CS02_SPEIfullTimeSeriesChartOptions =(
    intl,
    spei3TSDATA,
    spei24TSDATA) => ({
    chart: { type: "column", zoomType: "x" },
    title: { text: intl.formatMessage({ id: "global.plot.header_spei" }) },
    xAxis: { type: 'datetime',
        title: {text: intl.formatMessage({ id: "global.vars.date" })},
        categories: undefined,
        min: null,
        max: null},
    yAxis: [
        {title: {text: intl.formatMessage({ id: "global.vars.SPEI" }) + " " }, min: -3, max: 3, opposite: false},
    ],
    tooltip: {
        valueDecimals: 1,
        xDateFormat: '%Y-%m-%d',
    },
    series: [
        {
            name: intl.formatMessage({ id: "global.vars.SPEI3" }),
            data: spei3TSDATA || [],
            type: "spline",
            color: "#FF6961",
            yAxis: 0
        },
        {
            name: intl.formatMessage({ id: "global.vars.SPEI24" }),
            data: spei24TSDATA || [],
            type: "spline",
            color: "#FF7700",
            yAxis: 0
        },
    ]
});
