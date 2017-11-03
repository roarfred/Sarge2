using System;
using System.Collections.Generic;
using System.Drawing.Printing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sarge.Maps
{
    public class MapSetup
    {
        public MapSetup()
        {
            MapName = "topo2";
            ScaleAndTileSize = new ScaleAndTileSize();
            Margins = new Margins();
        }
        public string MapName { get; set; }
        public WmsMap Map
        {
            get
            {
                return new WmsMap(MapName);
            }
        }
        public Margins Margins { get; set; }
        public PaperSize PaperSize { get; set; }
        public ScaleAndTileSize ScaleAndTileSize { get; set; }

        public UtmPosition Location { get; set; }
        public bool ShowUtmGrid { get; set; }
        public bool ShowLatLonGrid { get; set; }
        public bool ShowCrossHair { get; set; }
        public int? RadiusR25 { get; set; }
        public int? RadiusR50 { get; set; }
        public string Title { get; set; }

        public UtmBounds GetPaperBounds()
        {
            if (PaperSize != null && ScaleAndTileSize != null)
            {
                double vWidthInMeters = (this.PaperSize.Width) * ScaleAndTileSize.Scale;
                double vHeightInMeter = (this.PaperSize.Height) * ScaleAndTileSize.Scale;
                return new UtmBounds(
                    new UtmPosition(33, this.Location.Easting - vWidthInMeters / 2, this.Location.Northing + vHeightInMeter / 2),
                    new UtmPosition(33, this.Location.Easting + vWidthInMeters / 2, this.Location.Northing - vHeightInMeter / 2)
                );
            }
            else
                return null;
        }



        public double TileSizeInMeters
        {
            get
            {
                return ScaleAndTileSize.TileSizeInMeters;
            }
        }

        public double PixelsPerMeter
        {
            get
            {
                return Map.TileSize / TileSizeInMeters;
            }
        }

        public UtmPosition GetStart(UtmBounds pBounds)
        {
            return new Maps.UtmPosition(
                33,
                Map.EastOrigin + Math.Floor((pBounds.NorthWest.Easting - Map.EastOrigin) / TileSizeInMeters) * TileSizeInMeters,
                Map.NorthOrigin + Math.Floor((pBounds.SouthEast.Northing - Map.NorthOrigin) / TileSizeInMeters) * TileSizeInMeters
            );
        }

        public int CountTiles(UtmBounds pBounds)
        {
            var vStart = GetStart(pBounds);
            int vHorizontalCount = (int)Math.Floor(((pBounds.SouthEast.Easting + TileSizeInMeters - vStart.Easting) / TileSizeInMeters));
            int vVerticalCount = (int)Math.Floor(((pBounds.NorthWest.Northing + TileSizeInMeters - vStart.Northing) / TileSizeInMeters));
            return vHorizontalCount * vVerticalCount;
        }
    }
}
