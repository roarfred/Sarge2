using System;
using System.Collections;
using System.Collections.Generic;
using System.Drawing;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sarge.Maps
{
    public class WmsMap
    {
        public WmsMap(string pName) : this(pName, pName)
        {
            
        }
        public WmsMap(string pName, string pLayer)
        {
            Name = pName;
            Layer = pLayer;
        }

        public override string ToString()
        {
            if (Name != null)
                return Name;
            else if (Name == Layer)
                return Layer;
            else
                return $"{Name} ({Layer})";
        }
        public string Name { get; private set; }
        public string Layer { get; private set; }
        public string BaseUrl { get
            {
                return "http://opencache.statkart.no/gatekeeper/gk/gk.open";
            }

        }
        
        public int TileSize
        {
            get { return 256; }
        }

        public double EastOrigin
        {
            get
            {
                return -2500000.0;
            }
        }

        public double NorthOrigin
        {
            get
            {
                return 3500000.0;
            }
        }
        public Uri GetUrl(double pLeft, double pTop, double pRight, double pBottom)
        {
            return GetUrl((float)pLeft, (float)pTop, (float)pRight, (float)pBottom);
        }
        public Uri GetUrl(float pLeft, float pTop, float pRight, float pBottom)
        {
            return GetUrl(new RectangleF(pLeft, pTop, pRight - pLeft, pBottom - pTop));
        }
        public Uri GetUrl(RectangleF pBoundingBox)
        {
            var vBbox = string.Format(NumberFormatInfo.InvariantInfo, "{0},{1},{2},{3}", pBoundingBox.X, pBoundingBox.Y, pBoundingBox.Right, pBoundingBox.Bottom);
            return new Uri($"{BaseUrl}?LAYERS={Layer}&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&FORMAT=image%2Fpng&SRS=EPSG%3A32633&BBOX={vBbox}&WIDTH={TileSize}&HEIGHT={TileSize}");
        }

        public static IEnumerable<WmsMap> CreateMaps()
        {
            return new[] {
                new WmsMap("topo4"),
                new WmsMap("topo4graatone"),
                new WmsMap("terreng_norgeskart"),
                new WmsMap("sjokartraster"),
                new WmsMap("toporaster3"),
                new WmsMap("kartdata2"),
                new WmsMap("norges_grunnkart"),
                new WmsMap("toporaster2_rik"),
                new WmsMap("barentswatch_grunnkart"),
                new WmsMap("barentswatch_stedsnavn"),
                new WmsMap("fjellskygge"),
                new WmsMap("sirkumpolar_grunnkart"),
                new WmsMap("sirkumpolar_stedsnavn"),
                new WmsMap("satelitt")
            };
        }

        public IEnumerable<ScaleAndTileSize> GetScales()
        {

            double vScale = 81920000;
            double vTileSizeInMeters = 5545984;
            List<ScaleAndTileSize> vPerfectScales = new List<ScaleAndTileSize>();
            for (int i = 0; i <= 20; i++)
            {
                vPerfectScales.Add(new ScaleAndTileSize() { Scale = vScale, TileSizeInMeters = vTileSizeInMeters });
                vScale /= 2.0;
                vTileSizeInMeters /= 2;
            }

            List<ScaleAndTileSize> vScales = new List<ScaleAndTileSize>();
            for (int i = 1000; i <= 100000; i *= 10)
            {
                foreach (var vFactor in new double[] { 1.0, 2.0, 5.0 })
                {
                    vScales.Add(new ScaleAndTileSize() { Scale = i * vFactor, TileSizeInMeters = GetLowResTileSize(i * vFactor, vPerfectScales), Name = $"1:{i * vFactor:0} (Low)" });
                    vScales.Add(new ScaleAndTileSize() { Scale = i * vFactor, TileSizeInMeters = GetHiResTileSize(i * vFactor, vPerfectScales), Name = $"1:{i * vFactor:0} (Hi)" });
                    vScales.Add(new ScaleAndTileSize() { Scale = i * vFactor, TileSizeInMeters = GetXHiResTileSize(i * vFactor, vPerfectScales), Name = $"1:{i * vFactor:0} (X Hi)" });
                }
            }

            return vScales;
        }


        private double GetXHiResTileSize(double vScale, List<ScaleAndTileSize> vPerfectScales)
        {
            return vPerfectScales.Where(v => v.Scale < vScale / 2).OrderByDescending(v => v.Scale).First().TileSizeInMeters;
        }
        private double GetHiResTileSize(double vScale, List<ScaleAndTileSize> vPerfectScales)
        {
            return vPerfectScales.Where(v => v.Scale < vScale).OrderByDescending(v => v.Scale).First().TileSizeInMeters;
        }

        private double GetLowResTileSize(double vScale, List<ScaleAndTileSize> vPerfectScales)
        {
            return vPerfectScales.Where(v => v.Scale >= vScale).OrderBy(v => v.Scale).First().TileSizeInMeters;
        }
    }
}
