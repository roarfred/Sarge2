using System.Collections.Generic;
using System.Xml.Serialization;

namespace Sarge.Maps.Gpx
{
    [XmlRoot(ElementName = "gpx")]
    public class GpxData
    {
        [XmlAttribute("version")]
        public string Version { get; set; }

        [XmlAttribute("creator")]
        public string Creator { get; set; }

        [XmlElement("trk")]
        public List<Track> Tracks { get; set; }

        [XmlElement("wpt")]
        public List<Waypoint> Waypoints { get; set; }
    }
}