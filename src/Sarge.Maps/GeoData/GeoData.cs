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
            var gpxData = Gpx.Parser.Parse(stream);

            return new GeoData()
            {
                Name = name,
                Tracks = GetTracks(gpxData.Tracks),
                Pois = GetPois(gpxData.Waypoints)
            };
        }

        private static IEnumerable<Poi> GetPois(IEnumerable<Gpx.Waypoint> gpsWaypoints)
        {
            var pois = new List<Poi>();
            foreach (var gpsWaypoint in gpsWaypoints)
            {
                pois.Add(new Poi()
                {
                    Name = gpsWaypoint.Name,
                    Symbol = gpsWaypoint.Symbol,
                    Position = new Position(gpsWaypoint.Longitude, gpsWaypoint.Latitude)
                });
            }
            return pois;
        }

        private static IEnumerable<Track> GetTracks(IEnumerable<Gpx.Track> gpsTracks)
        {
            var tracks = new List<Track>();
            foreach (var gpsTrack in gpsTracks)
            {
                foreach (var gpsSegment in gpsTrack.Segments)
                {
                    int i = 0;
                    var points = new List<TimePoint>();

                    foreach (var gpsPoint in gpsSegment.Points)
                    {
                        points.Add(new TimePoint(gpsPoint.Time, gpsPoint.Longitude, gpsPoint.Latitude));
                    }

                    string trackName = gpsTrack.Name ?? "Unnamed Track";
                    if (gpsTrack.Segments.Count > 1)
                        trackName += $" ({i})";

                    tracks.Add(new Track()
                    {
                        Name = trackName,
                        Points = points
                    });

                    i++;
                }
            }

            return tracks;
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
                    if (maxTime > TimeSpan.Zero && GetTimeDifference(points[j], points[j - 1]) > maxTime || maxDistance > 0 && GetDistance(points[j], points[j-1]) > maxDistance)
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

            if (minTrackPoints > 0)
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
