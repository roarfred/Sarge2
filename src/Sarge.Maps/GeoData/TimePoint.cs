using System;

namespace Sarge.Maps.GeoData
{
    public class TimePoint
    {
        public DateTime TimeUtc { get; set; }
        public Position Position { get; set; }

        public TimePoint(DateTime timeUtc, double longitude, double latitude)
        {
            TimeUtc = timeUtc;
            Position = new Position(longitude, latitude);
        }
    }
}