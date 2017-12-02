using ProjNet.CoordinateSystems;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace Sarge.Maps.GeoData
{
    public class GeoData
    {
        public IEnumerable<Track> Tracks { get; set; }
        public IEnumerable<Poi> Pois { get; set; }
        public string Name { get; set; }

        public static GeoData FromStream(Stream stream, string name)
        {
            var gpsData = Geo.Gps.GpsData.Parse(stream);

            var tracks = new List<Track>();
            foreach (var gpsTrack in gpsData.Tracks)
            {
                foreach (var gpsSegment in gpsTrack.Segments)
                {
                    int i = 0;
                    var points = new List<TimePoint>();

                    foreach (var gpsPoint in gpsSegment.Fixes)
                    {
                        points.Add(new TimePoint(gpsPoint.TimeUtc, gpsPoint.Coordinate.Longitude, gpsPoint.Coordinate.Latitude));
                    }

                    tracks.Add(new Track()
                    {
                        Name = name + $" track #{i + 1:000}",
                        Points = points
                    });

                    i++;
                }
            }
            return new GeoData()
            {
                Name = name,
                Tracks = tracks
            };
        }

        public void SplitTracks(int maxDistance, TimeSpan maxTime, int minTrackPoints)
        {
            var tracks = new List<Track>(this.Tracks);
            for (int i=0; i<tracks.Count; i++)
            {
                int trackNo = 0;
                var points = new List<TimePoint>(tracks[i].Points);
                for (int j=1; j<points.Count; j++)
                {
                    if (GetDistance(points[j], points[j-1]) > maxDistance || GetTimeDifference(points[j], points[j - 1]) > maxTime)
                    {
                        tracks[i].Points = points.Take(j - 1);
                        tracks.Insert(i + 1, new Track()
                        {
                            Name = tracks[i].Name + "_" + (++trackNo).ToString("00"),
                            Points = points.Skip(j)
                        });
                        break;
                    }
                }
            }

            tracks.RemoveAll(t => t.Points.Count() < minTrackPoints);
            this.Tracks = tracks;
        }

        public static double GetDistance(TimePoint timePoint1, TimePoint timePoint2)
        {
            var pos1 = new UtmPosition(timePoint1.Position.Longitude, timePoint1.Position.Latitude);
            var pos2 = new UtmPosition(timePoint2.Position.Longitude, timePoint2.Position.Latitude);

            if (pos2.Zone != pos1.Zone)
                pos2 = pos2.Transform(pos1.Zone);

            return Math.Sqrt(Math.Pow(pos1.Easting - pos2.Easting, 2) + Math.Pow(pos1.Northing - pos2.Northing, 2));
        }

        public static TimeSpan GetTimeDifference(TimePoint to, TimePoint from)
        {
            return to.TimeUtc.Subtract(from.TimeUtc);
        }
    }
}
