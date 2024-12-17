import { Box, Slider, SliderFilledTrack, SliderThumb, SliderTrack } from "@open-pioneer/chakra-integration";
import { useIntl } from "open-pioneer:react-hooks";
import { useMapModel } from "@open-pioneer/map";
import { CommonComponentProps, useCommonComponentProps } from "@open-pioneer/react-utils";
import { useEffect, useRef, useState } from "react";
import Layer from "ol/layer/Layer";
import RenderEvent from "ol/render/Event";
import { EventsKey } from "ol/events";
import { unByKey } from "ol/Observable";
import { getRenderPixel } from "ol/render";
import { Pixel } from "ol/pixel";

export interface LayerSwipeProps extends CommonComponentProps{
    mapId: string
    swipableLayer: Layer
}

export const LayerSwipe = (props: LayerSwipeProps) => {
    const intl = useIntl();
    const {mapId, swipableLayer} = props;
    const mapModel = useMapModel(mapId);
    const prerenderKey = useRef<EventsKey>();
    const postrenderKey = useRef<EventsKey>();
    const [sliderValue, setSliderValue] = useState(50)

    useEffect(() => {
        prerenderKey.current = swipableLayer.on("prerender", handlePrerender)
        postrenderKey.current = swipableLayer.on("postrender", handlePostrender)
        
        return () => {
            if(prerenderKey.current){
                unByKey(prerenderKey.current)
                prerenderKey.current = undefined;
            }
            if(postrenderKey.current){
                unByKey(postrenderKey.current)
                postrenderKey.current = undefined;
            }
        };
    }, [swipableLayer, mapModel])


    function handlePrerender(event: RenderEvent){
        const renderContext = event.context;
        const olMap = mapModel.map?.olMap;
        if(!renderContext || !olMap){
            return;
        }

        const mapSize = olMap.getSize();

        if(!mapSize || !mapSize[0] || !mapSize[1]){
            return;
        }

        const width = mapSize[0] * (sliderValue / 100);
        const swipableLayerRect: ClippingRectangle = {
            topLeft: getRenderPixel(event, [width, 0]),
            topRight: getRenderPixel(event, [mapSize[0], 0]),
            bottomLeft: getRenderPixel(event, [width, mapSize[1]]),
            bottomRight: getRenderPixel(event, mapSize)
        }
        
        if(renderContext instanceof WebGLRenderingContext){
            const contextWebGL = renderContext as WebGLRenderingContext;
            clipWebGLLayer(contextWebGL, swipableLayerRect);
        }else if(renderContext instanceof CanvasRenderingContext2D){
            const contextCanvas = renderContext as CanvasRenderingContext2D;
            clipCanvasLayer(contextCanvas, swipableLayerRect);
        }
     }
     
     function handlePostrender(event: RenderEvent){
        const renderContext = event.context;
        if(renderContext instanceof WebGLRenderingContext){
            const contextWebGL = renderContext as WebGLRenderingContext;
            contextWebGL.disable(contextWebGL.SCISSOR_TEST);
        }else if(renderContext instanceof CanvasRenderingContext2D){
            const contextCanvas = renderContext as CanvasRenderingContext2D;
            contextCanvas.restore();
        }
     }
     
     function clipWebGLLayer(renderContext: WebGLRenderingContext, visibleArea: ClippingRectangle){
        const bottomLeft = visibleArea.bottomLeft;
        const topRight = visibleArea.bottomRight;
      
        const width = Math.round((topRight[0]! - bottomLeft[0]!) * (sliderValue / 100));
        const height = topRight[1]! - bottomLeft[1]!;

        renderContext.enable(renderContext.SCISSOR_TEST);
        renderContext.scissor(bottomLeft[0]!, bottomLeft[1]!, width, height);
     }
     
     function clipCanvasLayer(renderContext: CanvasRenderingContext2D, visibleArea: ClippingRectangle){
        renderContext.save();
        renderContext.beginPath();
        renderContext.moveTo(visibleArea.topLeft[0]!, visibleArea.topLeft[1]!);
        renderContext.lineTo(visibleArea.bottomLeft[0]!, visibleArea.bottomLeft[1]!);
        renderContext.lineTo(visibleArea.bottomRight[0]!, visibleArea.bottomRight[1]!);
        renderContext.lineTo(visibleArea.topRight[0]!, visibleArea.topRight[1]!);
        renderContext.closePath();
        renderContext.clip();
     }
     
     function handleSliderValueChanged(value: number){
        const olMap = mapModel.map?.olMap;
        setSliderValue(value);

        if(olMap){
            olMap.render(); //trigger re-render when slider values is changed
        }
    }
    return (
        <Box position="absolute" top="10px" right="10px" bg="white" p={2} borderRadius="md" boxShadow="md">
            <Slider aria-label='slider-ex-1'  onChange={(value) => handleSliderValueChanged(value)}>
            <SliderTrack>
                <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
            </Slider>
        </Box>
    );


};

export interface ClippingRectangle{
    topLeft: Pixel
    topRight: Pixel
    bottomLeft: Pixel
    bottomRight: Pixel
}

