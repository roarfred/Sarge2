using ProjNet.CoordinateSystems;
using ProjNet.CoordinateSystems.Transformations;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Sarge.Maps
{
    public struct UtmPosition
    {
        public UtmPosition(int pZone, double pEasting, double pNorthing) : this()
        {
            Zone = pZone;
            Easting = pEasting;
            Northing = pNorthing;
        }

        public int Zone { get; set;  }
        public double Easting { get; set; }
        public double Northing { get; set; }

        public UtmPosition Move(double pEastingOffset, double pNorthingOffset)
        {
            // TODO: Should zone change?
            return new UtmPosition(this.Zone, this.Easting + pEastingOffset, this.Northing + pNorthingOffset);
        }

        public UtmPosition TransformFromWGS(int pToZone)
        {
            var vDestinationUTM = ProjectedCoordinateSystem.WGS84_UTM(pToZone, true);
            CoordinateTransformationFactory vTransformerFactory = new CoordinateTransformationFactory();
            var vTransformer = vTransformerFactory.CreateFromCoordinateSystems(GeographicCoordinateSystem.WGS84, vDestinationUTM);
            double[] vTransformed = vTransformer.MathTransform.Transform(new double[] { this.Easting, this.Northing });
            return new UtmPosition(pToZone, vTransformed[0], vTransformed[1]);
        }
        

        public UtmPosition TransformToWGS()
        {
            var vSourceUTM = ProjectedCoordinateSystem.WGS84_UTM(this.Zone, true);
            CoordinateTransformationFactory vTransformerFactory = new CoordinateTransformationFactory();
            var vTransformer = vTransformerFactory.CreateFromCoordinateSystems(vSourceUTM, GeographicCoordinateSystem.WGS84);
            double[] vTransformed = vTransformer.MathTransform.Transform(new double[] { this.Easting, this.Northing });
            return new UtmPosition(0, vTransformed[0], vTransformed[1]);
        }

        public UtmPosition Transform(int pToZone)
        {
            var vSourceUTM = ProjectedCoordinateSystem.WGS84_UTM(this.Zone, true);
            var vDestinationUTM = ProjectedCoordinateSystem.WGS84_UTM(pToZone, true);
            CoordinateTransformationFactory vTransformerFactory = new CoordinateTransformationFactory();
            var vTransformer = vTransformerFactory.CreateFromCoordinateSystems(vSourceUTM, vDestinationUTM);
            double[] vTransformed = vTransformer.MathTransform.Transform(new double[] { this.Easting, this.Northing });
            return new UtmPosition(pToZone, vTransformed[0], vTransformed[1]);
        }


        public UtmPosition Floor(double pDividor)
        {
            // TODO: Should zone change?
            return new UtmPosition(Zone, Math.Floor(this.Easting / pDividor) * pDividor, Math.Floor(this.Northing / pDividor) * pDividor);
        }

        public UtmPosition Ceiling(double pDividor)
        {
            // TODO: Should zone change?
            return new UtmPosition(Zone, Math.Ceiling(this.Easting / pDividor) * pDividor, Math.Ceiling(this.Northing / pDividor) * pDividor);
        }

        public UtmPosition ExtendBottomRight(double pDividor)
        {
            // TODO: Should zone change?
            return new UtmPosition(Zone, Math.Ceiling(this.Easting / pDividor) * pDividor, Math.Floor(this.Northing / pDividor) * pDividor);
        }
        public UtmPosition ExtendTopLeft(double pDividor)
        {
            // TODO: Should zone change?
            return new UtmPosition(Zone, Math.Floor(this.Easting / pDividor) * pDividor, Math.Ceiling(this.Northing / pDividor) * pDividor);
        }
        public override bool Equals(object obj)
        {
            if (obj is UtmPosition)
                return ((UtmPosition)obj).Easting == this.Easting && ((UtmPosition)obj).Northing == this.Northing;
            else
                return base.Equals(obj);
        }
        public override int GetHashCode()
        {
            return (this.Easting + this.Northing).GetHashCode();
        }

        public int GetUtmZone()
        {
            return GetUtmZone(this);
        }

        public static int GetUtmZone(UtmPosition position)
        {
            if (position.Zone == 0) // lat / long
                return GetUtmZone(position.Northing, position.Easting);
            else
                return GetUtmZone(position.TransformToWGS());
        }

        public static int GetUtmZone(double latitude, double longitude)
        {
            var zone = (int)Math.Floor(longitude / 6.0) + 31;

            // Exception #1: Zone 32 is widened (at the cost of zone 31) at the west coast of norway, between 56 and 64 degrees
            if (zone == 31 && latitude >= 56 && latitude < 64 && longitude > 3.0)
                zone++;

            // Exception #2: Between 72 and 84 degrees, the following zones are different:
            // 31: widened to 9 degrees, eastwards
            // 32: eliminated
            // 33: widened to 12 degrees, 3 degrees both east and west
            // 34: eliminated
            // 35: widened to 12 degrees, 3 degrees both east and west
            // 36: eliminated
            // 37: widened to 9 degrees, westwards
            if (zone > 31 && zone < 37 && latitude >= 72 && latitude < 84)
            {
                if (longitude < 9)
                    zone = 31;
                else if (longitude < 21)
                    zone = 33;
                else if (longitude < 33)
                    zone = 35;
                else
                    zone = 37;
            }

            return zone;
        }
    }
}
