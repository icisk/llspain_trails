import { Box, Slider, SliderFilledTrack, SliderThumb, SliderTrack } from "@open-pioneer/chakra-integration";
import { useIntl } from "open-pioneer:react-hooks";
import { MapModel, useMapModel } from "@open-pioneer/map";
import { CommonComponentProps, useCommonComponentProps } from "@open-pioneer/react-utils";
import { useEffect, useRef, useState } from "react";
import Layer from "ol/layer/Layer";
import RenderEvent from "ol/render/Event";
import { EventsKey } from "ol/events";
import { unByKey } from "ol/Observable";
import { getRenderPixel } from "ol/render";
import { Pixel } from "ol/pixel";
import { Size } from "ol/size";

export interface LayerSwipeProps extends CommonComponentProps{
    map: MapModel
    leftLayer: Layer
    rightLayer: Layer
}

export const LayerSwipe = (props: LayerSwipeProps) => {
    const intl = useIntl();
    const {map, leftLayer, rightLayer} = props;
    const leftPrerenderKey = useRef<EventsKey>();
    const leftPostrenderKey = useRef<EventsKey>();
    const rightPrerenderKey = useRef<EventsKey>();
    const rightPostrenderKey = useRef<EventsKey>();
    const sliderValue = useRef(50);

    useEffect(() => {
        leftPrerenderKey.current = leftLayer.on("prerender", handlePrerender)
        leftPostrenderKey.current = leftLayer.on("postrender", handlePostrender)
        rightPrerenderKey.current = rightLayer.on("prerender", handlePrerender)
        rightPostrenderKey.current = rightLayer.on("postrender", handlePostrender)
        
        return () => {
            if(leftPrerenderKey.current){
                unByKey(leftPrerenderKey.current)
                leftPrerenderKey.current = undefined;
            }
            if(leftPostrenderKey.current){
                unByKey(leftPostrenderKey.current)
                leftPostrenderKey.current = undefined;
            }
            if(rightPrerenderKey.current){
                unByKey(rightPrerenderKey.current)
                rightPrerenderKey.current = undefined;
            }
            if(rightPostrenderKey.current){
                unByKey(rightPostrenderKey.current)
                rightPostrenderKey.current = undefined;
            }
        };
    }, [leftLayer, rightLayer, map])


    function handlePrerender(event: RenderEvent){
        const renderContext = event.context;
        const olMap =map.olMap;
        if(!renderContext || !olMap){
            return;
        }

        const mapSize = olMap.getSize();

        if(!mapSize || mapSize[0] == undefined || mapSize[1] == undefined){
            return;
        }

        if(renderContext instanceof WebGLRenderingContext){
            const contextWebGL = renderContext as WebGLRenderingContext;
            clipWebGLLayer(event, contextWebGL, mapSize);
        }else if(renderContext instanceof CanvasRenderingContext2D){
            const contextCanvas = renderContext as CanvasRenderingContext2D;
            clipCanvasLayer(event, contextCanvas, mapSize);
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
     
     function clipWebGLLayer(event: RenderEvent, renderContext: WebGLRenderingContext, mapSize: Size){
        renderContext.enable(renderContext.SCISSOR_TEST);

        const bottomLeft = getRenderPixel(event, [0, mapSize[1]!]);
        const topRight = getRenderPixel(event, [mapSize[0]!, 0]);
      
        const width = Math.round((topRight[0]! - bottomLeft[0]!) * (sliderValue.current/ 100));
        const height = topRight[1]! - bottomLeft[1]!;

        const isRightLayer = event.target === rightLayer;

        if(isRightLayer){
            const x = width;
            const y = bottomLeft[1]!;
            const w = mapSize[0]! - width;
            const h = height;
            renderContext.scissor(x, y, w, h);
        }else{
            const x = bottomLeft[0]!;
            const y =  bottomLeft[1]!;
            const w = width;
            const h = height;
            renderContext.scissor(x, y, w, h);
        }
     }
     
     function clipCanvasLayer(event: RenderEvent, renderContext: CanvasRenderingContext2D, mapSize: Size){
        const width = mapSize[0]! * (sliderValue.current / 100);
        const topLeft = getRenderPixel(event, [width, 0]);
        const topRight = getRenderPixel(event, [mapSize[0]!, 0]);
        const bottomLeft = getRenderPixel(event, [width, mapSize[1]!]);
        const bottomRight = getRenderPixel(event, mapSize);

        const isRightLayer = event.target === rightLayer;

        renderContext.save();
        renderContext.beginPath();
        if(isRightLayer){
            renderContext.moveTo(topLeft[0]!, topLeft[1]!);
            renderContext.lineTo(bottomLeft[0]!, bottomLeft[1]!);
            renderContext.lineTo(bottomRight[0]!, bottomRight[1]!);
            renderContext.lineTo(topRight[0]!, topRight[1]!);

        }else{
            renderContext.moveTo(topLeft[0]!, topLeft[1]!);
            renderContext.lineTo(bottomLeft[0]!, bottomLeft[1]!);
            renderContext.lineTo(0, bottomLeft[1]!);
            renderContext.lineTo(0, 0);
        }
        renderContext.closePath();
        renderContext.clip();
     }
     
     function handleSliderValueChanged(value: number){
        sliderValue.current = value;
        const olMap = map.olMap;

        if(olMap){
            olMap.render(); //trigger re-render when slider values is changed
        }
    }
    return (
        <Box>
            <Slider aria-label='slider-ex-1'  onChange={(value) => {handleSliderValueChanged(value)}}>
            <SliderTrack>
                <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
            </Slider>
        </Box>
    );


};
