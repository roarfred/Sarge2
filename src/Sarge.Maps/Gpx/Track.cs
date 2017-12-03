using System.Collections.Generic;
using System.Xml.Serialization;

namespace Sarge.Maps.Gpx
{
    public class Track
    {
        [XmlElement("name")]
        public string Name { get; set; }
        [XmlElement("desc")]
        public string Description { get; set; }
        [XmlElement("trkseg")]
        public List<TrackSegment> Segments { get; set; }
    }
}