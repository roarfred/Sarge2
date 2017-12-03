using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml;
using System.Xml.Serialization;

namespace Sarge.Maps.Gpx
{
    public class Parser
    {
        public static GpxData Parse(System.IO.Stream gpxFileData)
        {
            var root = new XmlRootAttribute("gpx");
            root.Namespace = "http://www.topografix.com/GPX/1/1";
            XmlSerializer serializer = new XmlSerializer(typeof(GpxData), root);
            XmlTextReader reader = new XmlTextReader(gpxFileData);
            return serializer.Deserialize(reader) as GpxData;
        }
    }
}
