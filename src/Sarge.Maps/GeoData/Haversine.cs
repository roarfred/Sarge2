using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sarge.Maps.GeoData
{
    public static class Haversine
    {
        public static double Distance(Position a, Position b)
        {
            return Distance(a.Latitude, a.Longitude, b.Latitude, b.Longitude);
        }

        public static double Distance(double lat1, double lon1, double lat2, double lon2)
        {
            var R = 6371008.8; // Earth mean radius
            var φ1 = lat1.toRadians();
            var φ2 = lat2.toRadians();
            var Δφ = (lat2 - lat1).toRadians();
            var Δλ = (lon2 - lon1).toRadians();

            var a = Math.Sin(Δφ / 2) * Math.Sin(Δφ / 2) +
                    Math.Cos(φ1) * Math.Cos(φ2) *
                    Math.Sin(Δλ / 2) * Math.Sin(Δλ / 2);
            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

            var d = R * c;
            return d;
        }

        private static double toRadians(this double d)
        {
            return d / 360.0 * Math.PI * 2.0;
        }
    }
}
