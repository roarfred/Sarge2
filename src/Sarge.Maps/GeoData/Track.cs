using System.Linq;
using System.Collections.Generic;
using System;

namespace Sarge.Maps.GeoData
{
    public class Track
    {
        public IEnumerable<TimePoint> Points { get; set; }
        public string Name { get; set; }
        public int Duration
        {
            get
            {
                return (int)(Points.LastOrDefault()?.TimeUtc.Subtract(Points.First().TimeUtc).TotalMilliseconds ?? 0);
            }
        }
        public int PointCount => Points.Count();
    }
}