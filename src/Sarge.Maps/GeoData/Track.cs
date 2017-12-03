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
        public double Length => GetLength();

        private double GetLength()
        {
            double length = 0.0;
            TimePoint lastPoint = null;

            foreach (var point in Points)
            {
                if (lastPoint == null)
                    lastPoint = point;
                else
                {
                    length += lastPoint.Position.DistanceTo(point.Position);
                    lastPoint = point;
                }
            }

            return length;
        }
    }
}