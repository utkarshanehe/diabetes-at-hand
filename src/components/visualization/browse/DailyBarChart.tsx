/*import React, { useMemo, useContext } from 'react';
import { Rect, Line, G } from 'react-native-svg';
import { CommonBrowsingChartStyles, ChartProps, getChartElementColor, getChartElementOpacity, DateRangeScaleContext } from './common';
import { AxisSvg } from '@components/visualization/axis';
import { Padding } from '@components/visualization/types';
import { DateBandAxis } from './DateBandAxis';
import { scaleLinear } from 'd3-scale';
import * as d3Array from 'd3-array';
import Colors from '@style/Colors';
import { BandScaleChartTouchHandler } from './BandScaleChartTouchHandler';
import { coverValueInRange } from '@data-at-hand/core/utils';
import { TodayContext } from '@components/pages/exploration/contexts';
import { GoalValueIndicator } from './GoalValueIndicator';
import { Platform } from 'react-native';
import * as d3Shape from 'd3-shape';
interface Props extends ChartProps {
    valueTickFormat?: (num: number) => string,
    valueTicksOverride?: (maxValue: number) => {
        newDomain: number[],
        ticks: number[]
    }
}

export const DailyBarChart = React.memo((prop: Props) => {

    const { shouldHighlightElements, highlightReference } = CommonBrowsingChartStyles.makeHighlightInformation(prop, prop.dataSource)

    const today = useContext(TodayContext)

    const chartArea = CommonBrowsingChartStyles.CHART_AREA
    const scaleX = useContext(DateRangeScaleContext) || CommonBrowsingChartStyles
        .makeDateScale(undefined, prop.dateRange[0], prop.dateRange[1])

    const xTickFormat = useMemo(() => CommonBrowsingChartStyles.dateTickFormat(today), [today])

    const valueRange = useMemo(() => coverValueInRange(coverValueInRange(
        [0, Math.max(d3Array.max(prop.data, d => d.value)!, prop.preferredValueRange[1] || Number.MIN_SAFE_INTEGER)],
        highlightReference
    ), prop.goalValue), [prop.data, prop.preferredValueRange[1], highlightReference])

    const scaleY = useMemo(() => scaleLinear()
        .domain(valueRange)
        .range([chartArea.height, 0])
        .nice(), [valueRange, chartArea.height])


    const mean = useMemo(() => prop.data.length > 0 ? d3Array.mean(prop.data, d => d.value) : null, [prop.data])

    const ticks: number[] = useMemo(() => {
        if (prop.valueTicksOverride) {
            const tickInfo = prop.valueTicksOverride(scaleY.domain()[1])
            scaleY.domain(tickInfo.newDomain)
            return tickInfo.ticks
        }
        else return scaleY.ticks(5)
    }, [prop.valueTicksOverride, scaleY])

    const barWidth = Math.min(scaleX.bandwidth(), 25)

    return <BandScaleChartTouchHandler
        chartContainerWidth={CommonBrowsingChartStyles.CHART_WIDTH}
        chartContainerHeight={CommonBrowsingChartStyles.CHART_HEIGHT}
        chartArea={chartArea}
        scaleX={scaleX}
        dataSource={prop.dataSource}
        getValueOfDate={(date) => prop.data.find(d => d.numberedDate === date)?.value}
        highlightedDays={prop.dataDrivenQuery != null ? prop.highlightedDays : undefined}>
        <DateBandAxis key="xAxis" scale={scaleX} dateSequence={scaleX.domain()} today={today} tickFormat={xTickFormat} chartArea={chartArea} />
        <AxisSvg key="yAxis" tickMargin={0} ticks={ticks} tickFormat={prop.valueTickFormat} chartArea={chartArea} scale={scaleY} position={Padding.Left} />
        <G pointerEvents="none" {...chartArea}>
            {
                Platform.OS === 'android' ?
                    prop.data.map(d => {
                        const y = scaleY(d.value)
                        return <Line key={d.numberedDate}
                            strokeWidth={barWidth}

                            x={scaleX(d.numberedDate)! + scaleX.bandwidth() * 0.5}
                            y1={y}
                            y2={scaleY(0)}
                            stroke={getChartElementColor(shouldHighlightElements, prop.highlightedDays ? prop.highlightedDays[d.numberedDate] == true : false, today === d.numberedDate)}
                            opacity={getChartElementOpacity(today === d.numberedDate)}
                        />
                    }) : prop.data.map(d => {
                        const barHeight = scaleY(0) - scaleY(d.value)
                        return <Rect key={d.numberedDate}
                            width={barWidth} height={barHeight}
                            x={scaleX(d.numberedDate)! + (scaleX.bandwidth() - barWidth) * 0.5}
                            y={scaleY(d.value)}

                            fill={getChartElementColor(shouldHighlightElements, prop.highlightedDays ? prop.highlightedDays[d.numberedDate] == true : false, today === d.numberedDate)}
                            opacity={getChartElementOpacity(today === d.numberedDate)}
                        />
                    })
            }
            {
                mean != null && <Line x1={0} x2={chartArea.width} y={scaleY(mean)} stroke={Colors.chartAvgLineColor} strokeWidth={CommonBrowsingChartStyles.AVERAGE_LINE_WIDTH} strokeDasharray={"2"} />
            }
            <GoalValueIndicator yScale={scaleY} goal={prop.goalValue} lineLength={chartArea.width} labelAreaWidth={CommonBrowsingChartStyles.yAxisWidth} valueFormatter={prop.valueTickFormat} />
            {
                highlightReference != null ? <Line x1={0} x2={chartArea.width} y={scaleY(highlightReference)} stroke={Colors.highlightElementColor} strokeWidth={2} /> : null
            }
        </G>
    </BandScaleChartTouchHandler>
})


*/
import React, { useContext, useMemo } from 'react';
import { Circle, Line, Path, G } from 'react-native-svg';
import { CommonBrowsingChartStyles, ChartProps, getChartElementColor, getChartElementOpacity, DateRangeScaleContext } from './common';
import { AxisSvg } from '@components/visualization/axis';
import { Padding } from '@components/visualization/types';
import { DateBandAxis } from './DateBandAxis';
import { scaleLinear } from 'd3-scale';
import * as d3Array from 'd3-array';
import * as d3Shape from 'd3-shape';
import Colors from '@style/Colors';
import { BandScaleChartTouchHandler } from './BandScaleChartTouchHandler';
import { coverValueInRange, clusterSortedNumbers } from '@data-at-hand/core/utils';
import { TodayContext } from '@components/pages/exploration/contexts';
import { PointFallbackCircle } from './PointFallbackCircle';


export const DailyBarChart = React.memo((prop: ChartProps) => {

    const { shouldHighlightElements, highlightReference } = CommonBrowsingChartStyles.makeHighlightInformation(prop, prop.dataSource)

    console.log("highlightReference:", highlightReference)

    const today = useContext(TodayContext)

    const chartArea = CommonBrowsingChartStyles.CHART_AREA

    const scaleX = useContext(DateRangeScaleContext) || CommonBrowsingChartStyles
        .makeDateScale(undefined, prop.dateRange[0], prop.dateRange[1])

    const xTickFormat = CommonBrowsingChartStyles.dateTickFormat(today)

    const valueMin = Math.min(d3Array.min(prop.data, d => d.value)!, prop.preferredValueRange[0] || Number.MAX_SAFE_INTEGER)
    const valueMax = Math.max(d3Array.max(prop.data, d => d.value)!, prop.preferredValueRange[1] || Number.MIN_SAFE_INTEGER)

    const scaleY = scaleLinear()
        .domain(coverValueInRange([valueMin - 1, valueMax + 1], highlightReference))
        .range([chartArea.height, 0])
        .nice()

    const line = d3Shape.line<{ value: number, numberedDate: number }>()
        .x((d) => scaleX(d.numberedDate)! + scaleX.bandwidth() * 0.5)
        .y((d) => scaleY(d.value))
        .curve(d3Shape.curveCardinal)

    const avg = d3Array.mean(prop.data, d => d.value)!


    const clusters = useMemo(() => {

        if (prop.data.length === scaleX.domain().length) {
            return [prop.data]
        } else {
            const clusteredIndices = clusterSortedNumbers(prop.data.map(d => scaleX.domain().indexOf(d.numberedDate)))

            let pointer = 0
            const clusters = clusteredIndices.map(indexCluster => {
                const cluster = indexCluster.map((index: number, order: number) => {
                    return prop.data[pointer + order]
                })
                pointer += indexCluster.length
                return cluster
            })
            return clusters
        }
    }, [prop.dateRange, prop.data, scaleX])

    return <BandScaleChartTouchHandler
        chartContainerWidth={CommonBrowsingChartStyles.CHART_WIDTH}
        chartContainerHeight={CommonBrowsingChartStyles.CHART_HEIGHT}
        chartArea={chartArea} scaleX={scaleX} dataSource={prop.dataSource}
        getValueOfDate={(date) => prop.data.find(d => d.numberedDate === date)?.value}
        highlightedDays={prop.dataDrivenQuery != null ? prop.highlightedDays : undefined}>
        <DateBandAxis key="xAxis" scale={scaleX} dateSequence={scaleX.domain()} today={today} tickFormat={xTickFormat} chartArea={chartArea} />
        <AxisSvg key="yAxis" tickMargin={0} ticks={scaleY.ticks(5)} chartArea={chartArea} scale={scaleY} position={Padding.Left} />
        <G pointerEvents="none" {...chartArea}>
            {
                clusters.map((cluster, i) => {
                    return <Path key={i.toString()} d={line(cluster)!}
                        strokeWidth={2.5}
                        fill="transparent"
                        stroke={Colors.chartElementDefault}
                        opacity={0.3}
                    />
                })
            }
            {
                prop.data.map(d => {

                    return <PointFallbackCircle key={d.numberedDate}
                        x={scaleX(d.numberedDate)! + scaleX.bandwidth() * 0.5}
                        y={scaleY(d.value)}
                        r={Math.min(scaleX.bandwidth(), 8) / 2}
                        strokeWidth={2}
                        fill={Colors.WHITE}
                        stroke={getChartElementColor(shouldHighlightElements, prop.highlightedDays ? prop.highlightedDays[d.numberedDate] == true : false, today === d.numberedDate)}
                        opacity={getChartElementOpacity(today === d.numberedDate)}
                        thresholdRadius={1}
                    />
                })
            }
            {
                Number.isNaN(avg) === false && <Line x1={0} x2={chartArea.width} y={scaleY(avg)} stroke={Colors.chartAvgLineColor} strokeWidth={CommonBrowsingChartStyles.AVERAGE_LINE_WIDTH} strokeDasharray={"2"} />
            }
        </G>
    </BandScaleChartTouchHandler>

})

