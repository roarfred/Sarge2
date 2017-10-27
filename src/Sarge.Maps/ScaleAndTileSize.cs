using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sarge.Maps
{
    public class ScaleAndTileSize
    {
        public double Scale { get; set; }
        public double TileSizeInMeters { get; set; }
        public string Name { get; set; }
        public override string ToString()
        {
            return Name ?? $"{Scale} ({TileSizeInMeters})";
        }
    }

}
