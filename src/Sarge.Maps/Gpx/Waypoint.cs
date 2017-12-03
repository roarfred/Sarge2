using System;
using System.Xml.Serialization;

namespace Sarge.Maps.Gpx
{
    public class Waypoint
    {
        [XmlAttribute("lon")]
        public double Longitude { get; set; }
        [XmlAttribute("lat")]
        public double Latitude { get; set; }
        [XmlElement("name")]
        public string Name { get; set; }
        [XmlElement("sym")]
        public string Symbol { get; set; }
        [XmlElement("time")]
        public DateTime Time { get; set; }
    }
}