import MeasurementReport from "./MeasurementReport";
import TID300Ellipse from "../../utilities/TID300/Ellipse";
import CORNERSTONE_4_TAG from "./cornerstone4Tag";
import GenericTool from "./GenericTool";

const ELLIPTICALROI = "EllipticalRoi";

class EllipticalRoi extends GenericTool {
    // TODO: this function is required for all Cornerstone Tool Adapters, since it is called by MeasurementReport.
    static getMeasurementData(MeasurementGroup) {
        const toolState = super.getMeasurementData(MeasurementGroup);

        const { ContentSequence } = MeasurementGroup;

        const NUMGroup = this.getNumericContent(ContentSequence);

        const SCOORDGroup = this.getScoordContent(ContentSequence);

        const { GraphicData } = SCOORDGroup;

        const majorAxis = [
            { x: GraphicData[0], y: GraphicData[1] },
            { x: GraphicData[2], y: GraphicData[3] }
        ];
        const minorAxis = [
            { x: GraphicData[4], y: GraphicData[5] },
            { x: GraphicData[6], y: GraphicData[7] }
        ];

        // Calculate two opposite corners of box defined by two axes.

        const minorAxisLength = Math.sqrt(
            Math.pow(minorAxis[0].x - minorAxis[1].x, 2) +
                Math.pow(minorAxis[0].y - minorAxis[1].y, 2)
        );

        const minorAxisDirection = {
            x: (minorAxis[1].x - minorAxis[0].x) / minorAxisLength,
            y: (minorAxis[1].y - minorAxis[0].y) / minorAxisLength
        };

        const halfMinorAxisLength = minorAxisLength / 2;

        // First end point of major axis + half minor axis vector
        const corner1 = {
            x: majorAxis[0].x + minorAxisDirection.x * halfMinorAxisLength,
            y: majorAxis[0].y + minorAxisDirection.y * halfMinorAxisLength
        };

        // Second end point of major axis - half of minor axis vector
        const corner2 = {
            x: majorAxis[1].x - minorAxisDirection.x * halfMinorAxisLength,
            y: majorAxis[1].y - minorAxisDirection.y * halfMinorAxisLength
        };

        let ellipState = {
            toolName: ELLIPTICALROI,
            toolType: EllipticalRoi.toolType,
            cachedStats: {
                area: NUMGroup.MeasuredValueSequence[0].NumericValue,
                mean: NUMGroup.MeasuredValueSequence[1].NumericValue,
                stdDev: NUMGroup.MeasuredValueSequence[2].NumericValue
            },
            handles: {
                end: {
                    x: corner1.x,
                    y: corner1.y,
                    highlight: false,
                    active: false
                },
                initialRotation: 0,
                start: {
                    x: corner2.x,
                    y: corner2.y,
                    highlight: false,
                    active: false
                },
                textBox: {
                    hasMoved: false,
                    movesIndependently: false,
                    drawnIndependently: true,
                    allowedOutsideImage: true,
                    hasBoundingBox: true
                }
            }
        };

        ellipState = Object.assign(toolState, ellipState);

        return ellipState;
    }

    static getTID300RepresentationArguments(tool) {
        const TID300Rep = super.getTID300RepresentationArguments(tool);
        const { cachedStats, handles } = tool;
        const { start, end } = handles;
        //const { area } = cachedStats;

        const halfXLength = Math.abs(start.x - end.x) / 2;
        const halfYLength = Math.abs(start.y - end.y) / 2;

        const points = [];

        const center = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };

        if (halfXLength > halfYLength) {
            // X-axis major
            // Major axis
            points.push({ x: center.x - halfXLength, y: center.y });
            points.push({ x: center.x + halfXLength, y: center.y });
            // Minor axis
            points.push({ x: center.x, y: center.y - halfYLength });
            points.push({ x: center.x, y: center.y + halfYLength });
        } else {
            // Y-axis major
            // Major axis
            points.push({ x: center.x, y: center.y - halfYLength });
            points.push({ x: center.x, y: center.y + halfYLength });
            // Minor axis
            points.push({ x: center.x - halfXLength, y: center.y });
            points.push({ x: center.x + halfXLength, y: center.y });
        }

        const trackingIdentifierTextValue =
            CORNERSTONE_4_TAG + ":" + ELLIPTICALROI;

        return Object.assign(TID300Rep, {
            cachedStats,
            points,
            trackingIdentifierTextValue
        });
    }

    static checkMeasurementIntegrity(tool) {
        if (tool.hasOwnProperty("cachedStats")) {
            return true;
        } else {
            return false;
        }
    }
}

EllipticalRoi.toolType = ELLIPTICALROI;
EllipticalRoi.utilityToolType = ELLIPTICALROI;
EllipticalRoi.TID300Representation = TID300Ellipse;
EllipticalRoi.isValidCornerstoneTrackingIdentifier = TrackingIdentifier => {
    if (!TrackingIdentifier.includes(":")) {
        return false;
    }

    const [cornerstone4Tag, toolType] = TrackingIdentifier.split(":");

    if (cornerstone4Tag !== CORNERSTONE_4_TAG) {
        return false;
    }

    return toolType === ELLIPTICALROI;
};

MeasurementReport.registerTool(EllipticalRoi);

export default EllipticalRoi;
