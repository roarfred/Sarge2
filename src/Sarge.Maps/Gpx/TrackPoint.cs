using System;
using System.Xml.Serialization;

namespace Sarge.Maps.Gpx
{
    public class TrackPoint
    {
        [XmlAttribute("lon")]
        public double Longitude { get; set; }
        [XmlAttribute("lat")]
        public double Latitude { get; set; }
        [XmlElement("ele")]
        public double Elevation { get; set; }
        [XmlElement("time")]
        public DateTime Time { get; set; }
    }
}