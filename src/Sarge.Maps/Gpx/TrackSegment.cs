using System.Collections.Generic;
using System.Xml.Serialization;

namespace Sarge.Maps.Gpx
{
    public class TrackSegment
    {
        [XmlElement("trkpt")]
        public List<TrackPoint> Points { get; set; }
    }
}