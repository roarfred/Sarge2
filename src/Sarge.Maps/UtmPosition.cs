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
        public UtmPosition(double pEasting, double pNorthing) : this()
        {
            Easting = pEasting;
            Northing = pNorthing;
        }
        public double Easting { get; set; }
        public double Northing { get; set; }

        public UtmPosition Move(double pEastingOffset, double pNorthingOffset)
        {
            return new UtmPosition(this.Easting + pEastingOffset, this.Northing + pNorthingOffset);
        }

        public UtmPosition TransformFromWGS(int pToZone)
        {
            var vDestinationUTM = ProjectedCoordinateSystem.WGS84_UTM(pToZone, true);
            CoordinateTransformationFactory vTransformerFactory = new CoordinateTransformationFactory();
            var vTransformer = vTransformerFactory.CreateFromCoordinateSystems(GeographicCoordinateSystem.WGS84, vDestinationUTM);
            double[] vTransformed = vTransformer.MathTransform.Transform(new double[] { this.Easting, this.Northing });
            return new UtmPosition(vTransformed[0], vTransformed[1]);
        }
        

        public UtmPosition TransformToWGS(int pFromZone)
        {
            var vSourceUTM = ProjectedCoordinateSystem.WGS84_UTM(pFromZone, true);
            CoordinateTransformationFactory vTransformerFactory = new CoordinateTransformationFactory();
            var vTransformer = vTransformerFactory.CreateFromCoordinateSystems(vSourceUTM, GeographicCoordinateSystem.WGS84);
            double[] vTransformed = vTransformer.MathTransform.Transform(new double[] { this.Easting, this.Northing });
            return new UtmPosition(vTransformed[0], vTransformed[1]);
        }

        public UtmPosition Transform(int pFromZone, int pToZone)
        {
            var vSourceUTM = ProjectedCoordinateSystem.WGS84_UTM(pFromZone, true);
            var vDestinationUTM = ProjectedCoordinateSystem.WGS84_UTM(pToZone, true);
            CoordinateTransformationFactory vTransformerFactory = new CoordinateTransformationFactory();
            var vTransformer = vTransformerFactory.CreateFromCoordinateSystems(vSourceUTM, vDestinationUTM);
            double[] vTransformed = vTransformer.MathTransform.Transform(new double[] { this.Easting, this.Northing });
            return new UtmPosition(vTransformed[0], vTransformed[1]);
        }


        public UtmPosition Floor(double pDividor)
        {
            return new UtmPosition(Math.Floor(this.Easting / pDividor) * pDividor, Math.Floor(this.Northing / pDividor) * pDividor);
        }

        public UtmPosition Ceiling(double pDividor)
        {
            return new UtmPosition(Math.Ceiling(this.Easting / pDividor) * pDividor, Math.Ceiling(this.Northing / pDividor) * pDividor);
        }

        public UtmPosition ExtendBottomRight(double pDividor)
        {
            return new UtmPosition(Math.Ceiling(this.Easting / pDividor) * pDividor, Math.Floor(this.Northing / pDividor) * pDividor);
        }
        public UtmPosition ExtendTopLeft(double pDividor)
        {
            return new UtmPosition(Math.Floor(this.Easting / pDividor) * pDividor, Math.Ceiling(this.Northing / pDividor) * pDividor);
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
    }
}
