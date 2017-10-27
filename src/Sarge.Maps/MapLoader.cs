using DevExpress.XtraPrinting;
using PdfSharp;
using PdfSharp.Drawing;
using PdfSharp.Pdf;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.Drawing.Printing;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Sarge.Maps
{
    public class MapLoader
    {
        public event EventHandler<MapDownloadProgressEventArgs> DownloadProgress;
        public event EventHandler<CreateBitmapProgressEventArgs> CreateBitmapProgress;

        private MapSetup gSetup;
        private List<UtmPosition> gDownloadQueue = new List<UtmPosition>();
 
        public MapLoader()
        {
            this.Setup = new MapSetup();
            this.Font = new Font("Calibri", 16f);
        }
        public MapLoader(MapSetup pSetup) : this()
        {
            this.gSetup = pSetup;
        }
        public MapLoader(WmsMap pMap, ScaleAndTileSize pScaleAndTileSize, PaperSize pPaperSize) : this(new MapSetup()
        {
            MapName = pMap.Name,
            ScaleAndTileSize = pScaleAndTileSize,
            PaperSize = pPaperSize,
            Margins = new Margins()
        })
        {
           
        }

        protected void OnDownloadProgress(int pTotalFiles, int pDownloaded)
        {
            if (DownloadProgress != null)
                DownloadProgress(this, new Maps.MapDownloadProgressEventArgs() { TotalFiles = pTotalFiles, Downloaded = pDownloaded });
        }
        protected void OnCreateBitmapProgress(int pTotalFiles, int pProcessedFiles)
        {
            if (CreateBitmapProgress != null)
                CreateBitmapProgress(this, new Maps.CreateBitmapProgressEventArgs() { TotalFiles = pTotalFiles, Processed = pProcessedFiles });
        }
        private double HorizontalSpace
        {
            get
            {
                return (Setup.PaperSize.Width - (Margins.Left + Margins.Right) * 0.254 / 1000.0) * Setup.ScaleAndTileSize.Scale;
            }
        }

        private double VerticalSpace
        {
            get
            {
                return (Setup.PaperSize.Height - (Margins.Top + Margins.Bottom) * 0.254 / 1000.0) * Setup.ScaleAndTileSize.Scale;
            }
        }

        public UtmPosition OrigoUtm32
        {
            get
            {
                return PositionUtm32.Move(-HorizontalSpace / 2.0, VerticalSpace / 2.0);
            }
        }
        private UtmPosition BottomRigthUtm32
        {
            get
            {
                return PositionUtm32.Move(HorizontalSpace / 2.0, -VerticalSpace / 2.0);
            }
        }
        private UtmPosition BottomRigthUtm33
        {
            get
            {
                return BottomRigthUtm32.Transform(32, 33).ExtendBottomRight(Setup.TileSizeInMeters);
            }
        }
        public UtmPosition OrigoUtm33
        {
            get
            {
                return OrigoUtm32.Transform(32, 33).Move(-Setup.TileSizeInMeters, 0).ExtendTopLeft(Setup.TileSizeInMeters);
            }
        }
        public Font Font { get; set; }

        public UtmPosition PositionUtm32
        {
            get
            {
                return PositionUtm33.Transform(33, 32);
            }
        }
        public UtmPosition PositionUtm33
        {
            get
            {
                return gSetup.Location;
            }
            set
            {
                gSetup.Location = value;
            }
        }
        [Obsolete("Use Setup.Margins instead")]
        public Margins Margins
        {
            get { return Setup.Margins; }
            set { Setup.Margins = value; }
        }
        public MapSetup Setup
        {
            get { return gSetup; }
            set { gSetup = value; }
        }

        public PointF Utm33ToBitmapPosition(UtmPosition pPosition, UtmPosition pOrigo)
        {
            return Utm33ToBitmapPosition(pPosition, pOrigo, 1F);
        }
        public PointF Utm33ToBitmapPosition(UtmPosition pPosition, UtmPosition pOrigo, float pZoom)
        {
            return new PointF((float)((pPosition.Easting - pOrigo.Easting) * Setup.PixelsPerMeter / pZoom), (float)((-pPosition.Northing + pOrigo.Northing) * Setup.PixelsPerMeter / pZoom));
        }
        private string GetFilename(UtmPosition pImagePosition, double pTileSizeInMeters, int pTileSize)
        {
            string vFolder = Path.GetTempPath() + "\\MapPrinter\\" + Setup.Map.Name + "\\" + pTileSize + "\\" + pTileSizeInMeters.ToString("0");
            if (!Directory.Exists(vFolder))
                Directory.CreateDirectory(vFolder);
            return vFolder + "\\" + string.Format("{0:0}_{1:0}.png", pImagePosition.Easting, pImagePosition.Northing);
        }
        private Size GetImageSize()
        {
            var vHeight = VerticalSpace * Setup.PixelsPerMeter;
            var vWidth = HorizontalSpace * Setup.PixelsPerMeter;
            return new Size((int)vWidth, (int)vHeight);
        }
        public void DrawPreview(Graphics vGraphics, Rectangle vImageRect, float pPreviewZoom)
        {
            var vCenter33 = PositionUtm32.Transform(32, 33);
            var vOrigoUtm33 = vCenter33.Move(-vImageRect.Width / 2.0 / Setup.PixelsPerMeter * pPreviewZoom, vImageRect.Height / 2.0 / Setup.PixelsPerMeter * pPreviewZoom);
            var vBottomRightUtm33 = vCenter33.Move(vImageRect.Width / 2.0 / Setup.PixelsPerMeter * pPreviewZoom, -vImageRect.Height / 2.0 / Setup.PixelsPerMeter * pPreviewZoom);

            var vBounds = new UtmBounds(
                vOrigoUtm33, vBottomRightUtm33
                );

            var vTask = DownloadAllImagesAsync(vBounds);
            DrawMap(vGraphics, pPreviewZoom, vBounds);

            vGraphics.InterpolationMode = System.Drawing.Drawing2D.InterpolationMode.HighQualityBicubic;
            vGraphics.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.AntiAlias;
            vGraphics.CompositingQuality = System.Drawing.Drawing2D.CompositingQuality.HighQuality;
            SizeF vLabelRectSizeUtm = new SizeF(30F, 20F);
            SizeF vLabelRectSizeLatLong = new SizeF(40F, 20F);
            if (Setup.ShowUtmGrid)
                DrawUtmGrid(vGraphics, vOrigoUtm33, vBottomRightUtm33, pPreviewZoom, vLabelRectSizeUtm);
            if (Setup.ShowLatLonGrid)
                DrawLatLongGrid(vGraphics, vOrigoUtm33, vBottomRightUtm33, pPreviewZoom, vLabelRectSizeLatLong);

            RectangleF vPaperRect = new RectangleF();
            vPaperRect.Size = GetImageSize();
            vPaperRect.Width /= (float)pPreviewZoom;
            vPaperRect.Height /= (float)pPreviewZoom;
            vPaperRect.Offset((vImageRect.Width - vPaperRect.Width) / 2F, (vImageRect.Height - vPaperRect.Height) / 2F);
            var vPaperPen = new Pen(Color.Green, 5F);
            vGraphics.DrawRectangle(vPaperPen, vPaperRect.X, vPaperRect.Y, vPaperRect.Width, vPaperRect.Height);

            if (Setup.ShowCrossHair)
                DrawCrossHair(vGraphics, vCenter33, vOrigoUtm33, pPreviewZoom);

            if (Setup.RadiusR25.HasValue)
                DrawRadius(vGraphics, vCenter33, vOrigoUtm33, Setup.RadiusR25.Value, pPreviewZoom);

            if (Setup.RadiusR50.HasValue)
                DrawRadius(vGraphics, vCenter33, vOrigoUtm33, Setup.RadiusR50.Value, pPreviewZoom);



        }


        private void DrawLatLongGrid(Graphics vGraphics, UtmPosition pOrigoUtm33, UtmPosition pBottomRightUtm33, float pZoom, SizeF vLabelRectSize)
        {
            var vOrigoWGS = pOrigoUtm33.TransformToWGS(33);
            var vBottomRigthWGS = pBottomRightUtm33.TransformToWGS(33);
            var vBottomLeftWGS = new UtmPosition(pOrigoUtm33.Easting, pBottomRightUtm33.Northing).TransformToWGS(33);
            var vTopRightWGS = new UtmPosition(pBottomRightUtm33.Easting, pOrigoUtm33.Northing).TransformToWGS(33);

            double vStartEasting = Math.Min(vOrigoWGS.Easting, vBottomLeftWGS.Easting);
            vStartEasting = Math.Floor(vStartEasting / 0.1) * 0.1;
            double vEndEasting = Math.Max(vTopRightWGS.Easting, vBottomRigthWGS.Easting);
            vEndEasting = Math.Ceiling(vEndEasting / 0.1) * 0.1;

            double vStartNorthing = Math.Min(vBottomLeftWGS.Northing, vBottomRigthWGS.Northing);
            vStartNorthing = Math.Floor(vStartNorthing / 0.1) * 0.1;
            double vEndNorthing = Math.Max(vOrigoWGS.Northing, vTopRightWGS.Northing);
            vEndNorthing = Math.Ceiling(vEndNorthing / 0.1) * 0.1;

            Pen vLinePen = new Pen(Color.FromArgb(150, Color.Red), (float)(Setup.PixelsPerMeter * Setup.ScaleAndTileSize.Scale / 3000.0));
            Pen vSolidLinePen = new Pen(Color.FromArgb(200, Color.Red), (float)(Setup.PixelsPerMeter * Setup.ScaleAndTileSize.Scale / 2000.0));

            for (double x = vStartEasting; x <= vEndEasting; x += 0.1)
            {
                var vStartWGS = new UtmPosition(x, vStartNorthing);
                var vMidWGS = new UtmPosition(x, vStartNorthing + (vEndNorthing - vStartNorthing) / 2.0);
                var vEndWGS = new UtmPosition(x, vEndNorthing);

                var vStartUtm33 = vStartWGS.TransformFromWGS(33);
                var vMidUtm33 = vMidWGS.TransformFromWGS(33);
                var vEndUtm33 = vEndWGS.TransformFromWGS(33);
                PointF vStart = Utm33ToBitmapPosition(vStartUtm33, pOrigoUtm33, pZoom);
                PointF vMid = Utm33ToBitmapPosition(vMidUtm33, pOrigoUtm33, pZoom);
                PointF vEnd = Utm33ToBitmapPosition(vEndUtm33, pOrigoUtm33, pZoom);
                if (Math.Round(x, 1) % 1.0 == 0.0)
                    vGraphics.DrawCurve(vSolidLinePen, new PointF[] { vStart, vMid, vEnd });
                else
                    vGraphics.DrawCurve(vLinePen, new PointF[] { vStart, vMid, vEnd });

                float vIncline = (vEnd.X - vStart.X) / (vEnd.Y - vStart.Y);
                PointF vLabelPosition = new PointF(vStart.X - vIncline * vStart.Y, 0);
                RectangleF vLabelRect = new RectangleF(vLabelPosition.X - vLabelRectSize.Width / 2F, vLabelPosition.Y, vLabelRectSize.Width, vLabelRectSize.Height);
                DrawLabelWGS(vGraphics, vLabelRect, vStartWGS.Easting);

                vLabelPosition = new PointF(vStart.X - vIncline * (vStart.Y - vGraphics.VisibleClipBounds.Height), vGraphics.VisibleClipBounds.Height - vLabelRectSize.Height);
                vLabelRect = new RectangleF(vLabelPosition.X - vLabelRectSize.Width / 2F, vLabelPosition.Y, vLabelRectSize.Width, vLabelRectSize.Height);
                DrawLabelWGS(vGraphics, vLabelRect, vStartWGS.Easting);
            }
            for (double y = vStartNorthing; y <= vEndNorthing; y += 0.1)
            {
                var vStartWGS = new UtmPosition(vStartEasting, y);
                var vMidWGS = new UtmPosition(vStartEasting + (vEndEasting - vStartEasting) / 2.0, y);
                var vEndWGS = new UtmPosition(vEndEasting, y);

                var vStartUtm33 = vStartWGS.TransformFromWGS(33);
                var vMidUtm33 = vMidWGS.TransformFromWGS(33);
                var vEndUtm33 = vEndWGS.TransformFromWGS(33);
                PointF vStart = Utm33ToBitmapPosition(vStartUtm33, pOrigoUtm33, pZoom);
                PointF vMid = Utm33ToBitmapPosition(vMidUtm33, pOrigoUtm33, pZoom);
                PointF vEnd = Utm33ToBitmapPosition(vEndUtm33, pOrigoUtm33, pZoom);
                if (Math.Round(y, 1) % 1.0 == 0.0)
                    vGraphics.DrawCurve(vSolidLinePen, new PointF[] { vStart, vMid, vEnd });
                else
                    vGraphics.DrawCurve(vLinePen, new PointF[] { vStart, vMid, vEnd });

                float vIncline = (vEnd.Y - vStart.Y) / (vEnd.X - vStart.X);
                PointF vLabelPosition = new PointF(0, vStart.Y - vIncline * vStart.X);
                RectangleF vLabelRect = new RectangleF(vLabelPosition.X, vLabelPosition.Y - vLabelRectSize.Height / 2F, vLabelRectSize.Width, vLabelRectSize.Height);
                DrawLabelWGS(vGraphics, vLabelRect, vStartWGS.Northing);

                vLabelPosition = new PointF(vGraphics.VisibleClipBounds.Width - vLabelRectSize.Width, vStart.Y - vIncline * (vStart.X - vGraphics.VisibleClipBounds.Width));
                vLabelRect = new RectangleF(vLabelPosition.X, vLabelPosition.Y - vLabelRectSize.Height / 2F, vLabelRectSize.Width, vLabelRectSize.Height);
                DrawLabelWGS(vGraphics, vLabelRect, vStartWGS.Northing);
            }
        }

        public Task<Bitmap> CreateBitmapForPrintAsync()
        {
            return CreateBitmapAsync(new Maps.UtmBounds(OrigoUtm33, BottomRigthUtm33));
        }

        private void DrawUtmGrid(Graphics vGraphics, UtmPosition pOrigoUtm33, UtmPosition pBottomRightUtm33, float pZoom, SizeF vLabelRectSize)
        {
            var vOrigoUtm32 = pOrigoUtm33.Transform(33, 32);
            var vBottomRigthUtm32 = pBottomRightUtm33.Transform(33, 32);
            var vBottomLeft32 = new UtmPosition(pOrigoUtm33.Easting, pBottomRightUtm33.Northing).Transform(33, 32);
            var vTopRight32 = new UtmPosition(pBottomRightUtm33.Easting, pOrigoUtm33.Northing).Transform(33, 32);

            double vStartEasting = Math.Min(vOrigoUtm32.Easting, vBottomLeft32.Easting);
            vStartEasting = Math.Floor(vStartEasting / 1000.0) * 1000.0;
            double vEndEasting = Math.Max(vTopRight32.Easting, vBottomRigthUtm32.Easting);
            vEndEasting = Math.Ceiling(vEndEasting / 1000.0) * 1000.0;

            double vStartNorthing = Math.Min(vBottomLeft32.Northing, vBottomRigthUtm32.Northing);
            vStartNorthing = Math.Floor(vStartNorthing / 1000.0) * 1000.0;
            double vEndNorthing = Math.Max(vOrigoUtm32.Northing, vTopRight32.Northing);
            vEndNorthing = Math.Ceiling(vEndNorthing / 1000.0) * 1000.0;

            Pen vLinePen = new Pen(Color.FromArgb(150, Color.Blue), (float)(Setup.PixelsPerMeter * Setup.ScaleAndTileSize.Scale) / 3000F);
            Pen vSolidLinePen = new Pen(Color.FromArgb(200, Color.Blue), (float)(Setup.PixelsPerMeter * Setup.ScaleAndTileSize.Scale) / 2000F);

            for (double x = vStartEasting; x <= vEndEasting; x += 1000.0)
            {
                var vStartUtm32 = new UtmPosition(x, vStartNorthing);
                var vEndUtm32 = new UtmPosition(x, vEndNorthing);

                var vStartUtm33 = vStartUtm32.Transform(32, 33);
                var vEndUtm33 = vEndUtm32.Transform(32, 33);
                PointF vStart = Utm33ToBitmapPosition(vStartUtm33, pOrigoUtm33, pZoom);
                PointF vEnd = Utm33ToBitmapPosition(vEndUtm33, pOrigoUtm33, pZoom);
                if (Math.Round(x, 1) % 10000.0 == 0.0)
                    vGraphics.DrawLine(vSolidLinePen, vStart, vEnd);
                else
                    vGraphics.DrawLine(vLinePen, vStart, vEnd);

                float vIncline = (vEnd.X - vStart.X) / (vEnd.Y - vStart.Y);
                PointF vLabelPosition = new PointF(vStart.X - vIncline * vStart.Y, 0);
                RectangleF vLabelRect = new RectangleF(vLabelPosition.X - vLabelRectSize.Width / 2F, vLabelPosition.Y, vLabelRectSize.Width, vLabelRectSize.Height);
                DrawLabelUTM(vGraphics, vLabelRect, vStartUtm32.Easting);

                vLabelPosition = new PointF(vStart.X - vIncline * (vStart.Y - vGraphics.VisibleClipBounds.Height), vGraphics.VisibleClipBounds.Height - vLabelRectSize.Height);
                vLabelRect = new RectangleF(vLabelPosition.X - vLabelRectSize.Width / 2F, vLabelPosition.Y, vLabelRectSize.Width, vLabelRectSize.Height);
                DrawLabelUTM(vGraphics, vLabelRect, vStartUtm32.Easting);
            }
            for (double y = vStartNorthing; y <= vEndNorthing; y += 1000.0)
            {
                var vStartUtm32 = new UtmPosition(vStartEasting, y);
                var vEndUtm32 = new UtmPosition(vEndEasting, y);

                var vStartUtm33 = vStartUtm32.Transform(32, 33);
                var vEndUtm33 = vEndUtm32.Transform(32, 33);
                PointF vStart = Utm33ToBitmapPosition(vStartUtm33, pOrigoUtm33, pZoom);
                PointF vEnd = Utm33ToBitmapPosition(vEndUtm33, pOrigoUtm33, pZoom);
                if (Math.Round(y, 1) % 10000.0 == 0.0)
                    vGraphics.DrawLine(vSolidLinePen, vStart, vEnd);
                else
                    vGraphics.DrawLine(vLinePen, vStart, vEnd);

                float vIncline = (vEnd.Y - vStart.Y) / (vEnd.X - vStart.X);
                PointF vLabelPosition = new PointF(0, vStart.Y - vIncline * vStart.X);
                RectangleF vLabelRect = new RectangleF(vLabelPosition.X, vLabelPosition.Y - vLabelRectSize.Height / 2F, vLabelRectSize.Width, vLabelRectSize.Height);
                DrawLabelUTM(vGraphics, vLabelRect, vStartUtm32.Northing);

                vLabelPosition = new PointF(vGraphics.VisibleClipBounds.Width - vLabelRectSize.Width, vStart.Y - vIncline * (vStart.X - vGraphics.VisibleClipBounds.Width));
                vLabelRect = new RectangleF(vLabelPosition.X, vLabelPosition.Y - vLabelRectSize.Height / 2F, vLabelRectSize.Width, vLabelRectSize.Height);
                DrawLabelUTM(vGraphics, vLabelRect, vStartUtm32.Northing);
            }
        }
        private void DrawLabelWGS(Graphics pGraphics, RectangleF pLabelRect, double pCoordinate)
        {
            string vText = string.Format("{0:0.0}°", pCoordinate);
            DrawLabel(pGraphics, pLabelRect, Color.Red, vText);
        }
        private void DrawLabelUTM(Graphics pGraphics, RectangleF pLabelRect, double pCoordinate)
        {
            DrawLabel(pGraphics, pLabelRect, Color.Blue, ((pCoordinate / 1000) % 100).ToString());
        }
        private void DrawLabel(Graphics pGraphics, RectangleF pLabelRect, Color pColor, string pText)
        {
            var vFont = new Font("Tahoma", pLabelRect.Height * 0.6F, FontStyle.Bold, GraphicsUnit.Pixel);
            pGraphics.FillRectangle(new SolidBrush(Color.FromArgb(100, Color.White)), pLabelRect);
            pGraphics.DrawRectangle(new Pen(Color.FromArgb(100, pColor), 1f), pLabelRect.X, pLabelRect.Y, pLabelRect.Width, pLabelRect.Height);
            pGraphics.DrawString(pText, vFont, new SolidBrush(pColor), pLabelRect, new StringFormat() { Alignment = StringAlignment.Center, LineAlignment = StringAlignment.Center, FormatFlags = StringFormatFlags.NoWrap });
        }

        private void DrawRadius(Graphics pGraphics, UtmPosition pCenter33, UtmPosition pOrigoUtm33, int pRadius, float pZoom)
        {
            if (pRadius > 0)
            {
                PointF vCenter = Utm33ToBitmapPosition(pCenter33, pOrigoUtm33, pZoom);
                var vPen = new Pen(Color.FromArgb(255, Color.Blue), 2.5f);
                float vSize = (float)((float)pRadius / (float)Setup.PixelsPerMeter / (float)pZoom);

                var vUpperLeftPosition = new UtmPosition(pCenter33.Easting - pRadius, pCenter33.Northing + pRadius);
                var vBottomRightPosition = new UtmPosition(pCenter33.Easting + pRadius, pCenter33.Northing - pRadius);

                PointF vUpperLeft = Utm33ToBitmapPosition(vUpperLeftPosition, pOrigoUtm33, pZoom);
                PointF vBottomRight = Utm33ToBitmapPosition(vBottomRightPosition, pOrigoUtm33, pZoom);

                pGraphics.DrawEllipse(vPen, vUpperLeft.X, vUpperLeft.Y, vBottomRight.X - vUpperLeft.X, vBottomRight.Y - vUpperLeft.Y);
            }
        }

        private void DrawCrossHair(Graphics pGraphics, UtmPosition pCenter33, UtmPosition pOrigoUtm33, float pZoom)
        {
            PointF vCenter = Utm33ToBitmapPosition(pCenter33, pOrigoUtm33, pZoom);
            var vPen = new Pen(Color.FromArgb(200, Color.Black), 2.5f);
            float vSize = 50;
            float vOpening = 5;
            pGraphics.DrawLine(vPen, vCenter.X, vCenter.Y - vSize, vCenter.X, vCenter.Y - vOpening);
            pGraphics.DrawLine(vPen, vCenter.X, vCenter.Y + vSize, vCenter.X, vCenter.Y + vOpening);
            pGraphics.DrawLine(vPen, vCenter.X - vSize, vCenter.Y, vCenter.X - vOpening, vCenter.Y);
            pGraphics.DrawLine(vPen, vCenter.X + vSize, vCenter.Y, vCenter.X + vOpening, vCenter.Y);
        }

        //public async Task CreatePDFWithSpireAsync(Bitmap pBitmap, string pTitle, Image pLogo, Stream pOutput)
        //{
        //    var vTask = Task.Run(() =>
        //    {
        //        //Create a pdf document.
        //        PdfDocument doc = new PdfDocument();

        //        PdfUnitConvertor vUnitConverter = new PdfUnitConvertor();

        //        PdfMargins vMargins = new PdfMargins(0); // new PdfMargins(Setup.Margins.Left, Setup.Margins.Top, Setup.Margins.Right, Setup.Margins.Bottom);
        //        vMargins.Left = vUnitConverter.ConvertUnits(Setup.Margins.Left / 100f, PdfGraphicsUnit.Inch, PdfGraphicsUnit.Point);
        //        vMargins.Top = vUnitConverter.ConvertUnits(Setup.Margins.Top / 100f, PdfGraphicsUnit.Inch, PdfGraphicsUnit.Point);
        //        vMargins.Right = vUnitConverter.ConvertUnits(Setup.Margins.Right / 100f, PdfGraphicsUnit.Inch, PdfGraphicsUnit.Point);
        //        vMargins.Bottom = vUnitConverter.ConvertUnits(Setup.Margins.Bottom / 100f, PdfGraphicsUnit.Inch, PdfGraphicsUnit.Point);

        //        // Create one page
        //        PdfPageBase page = doc.Pages.Add(new SizeF(
        //            vUnitConverter.ConvertUnits(Setup.PaperSize.Width * 1000f, PdfGraphicsUnit.Millimeter, PdfGraphicsUnit.Point),
        //            vUnitConverter.ConvertUnits(Setup.PaperSize.Height * 1000f, PdfGraphicsUnit.Millimeter, PdfGraphicsUnit.Point)
        //        ), vMargins);

                
        //        PdfImage vImage = PdfImage.FromImage(pBitmap);

        //        var vDocumentUnitsFactor = 1000.0f / 0.254f;
        //        float vWidth = (float)(Setup.PaperSize.Width - (Setup.Margins.Left + Setup.Margins.Right) * 0.254 / 1000.0);// -100;
        //        float vHeight = (float)(Setup.PaperSize.Height - (Setup.Margins.Top + Setup.Margins.Bottom) * 0.254 / 1000.0);// -100;
        //        var vRect = new RectangleF(0f, 0f, page.ActualSize.Width - vMargins.Left - vMargins.Right, page.ActualSize.Height - vMargins.Top - vMargins.Bottom); //new RectangleF(0f, 0f, vWidth * vDocumentUnitsFactor * 0.958f, vHeight * vDocumentUnitsFactor * 0.958f); //vIndex[0] * vBitmap.Width, vIndex[1] * vBitmap.Height, vBitmap.Width, vBitmap.Height);

        //        page.Canvas.DrawImage(vImage, vRect);

        //        doc.SaveToStream(pOutput);
        //        /*

        //        LinkBase vLink = new Link(new PrintingSystem());
        //        vLink.MinMargins = new Margins(0, 0, 0, 0);
        //        vLink.Margins = Setup.Margins;
        //        vLink.PaperKind = PaperKind.Custom;
        //        vLink.CustomPaperSize = new System.Drawing.Size((int)(Setup.PaperSize.Width * 1000.0 / 0.254), (int)(Setup.PaperSize.Height * 1000.0 / 0.254));
        //        vLink.PaperName = Setup.PaperSize.Name;

        //        vLink.CreateDetailArea += (s, e) =>
        //        {
        //            ImageBrick vBrick = new ImageBrick(new BrickStyle(BorderSide.None, 0f, Color.Empty, Color.Empty, Color.Empty, this.Font, null));
        //            vBrick.Image = pBitmap;
        //            vBrick.SizeMode = ImageSizeMode.ZoomImage;
        //            vBrick.Separable = false;
        //            vBrick.NoClip = false;

        //            var vDocumentUnitsFactor = 1000.0f / 0.254f;
        //            float vWidth = (float)(Setup.PaperSize.Width - (Setup.Margins.Left + Setup.Margins.Right) * 0.254 / 1000.0);// -100;
        //            float vHeight = (float)(Setup.PaperSize.Height - (Setup.Margins.Top + Setup.Margins.Bottom) * 0.254 / 1000.0);// -100;
        //            var vRect = new RectangleF(0f, 0f, vWidth * vDocumentUnitsFactor * 0.958f, vHeight * vDocumentUnitsFactor * 0.958f); //vIndex[0] * vBitmap.Width, vIndex[1] * vBitmap.Height, vBitmap.Width, vBitmap.Height);

        //            e.Graph.DrawBrick(vBrick, vRect);

        //            if (!string.IsNullOrEmpty(pTitle))
        //            {
        //                TextBrick vTitle = new TextBrick(BorderSide.All, 1f, Color.Black, Color.FromArgb(200, Color.White), Color.Red);
        //                vTitle.Font = new Font("Arial", 14f);
        //                vTitle.Location = new PointF(0f, 0f);
        //                vTitle.Text = pTitle;
        //                vTitle.Padding = new PaddingInfo(5, 0, 5, 0, 100);
        //                var vStringSize = e.Graph.MeasureString(pTitle, vTitle.Font);
        //                vTitle.Rect = new RectangleF(30f, 25f, vStringSize.Width + 10, vStringSize.Height + 8);
        //                e.Graph.DrawBrick(vTitle);
        //            }

        //            if (pLogo != null)
        //            {
        //                ImageBrick vLogoBrick = new ImageBrick(new BrickStyle(BorderSide.All, 2f, Color.Black, Color.White, Color.Empty, this.Font, null));
        //                vLogoBrick.Image = pLogo;
        //                vLogoBrick.SizeMode = ImageSizeMode.ZoomImage;
        //                vLogoBrick.Separable = false;
        //                vLogoBrick.NoClip = false;
        //                var vLogoSize = new SizeF(pLogo.Width / 2, pLogo.Height / 2);
        //                RectangleF vLogoRect = new RectangleF(vRect.Right - vLogoSize.Width - 30, vRect.Height - vLogoSize.Height - 20, vLogoSize.Width, vLogoSize.Height);
        //                e.Graph.DrawBrick(vLogoBrick, vLogoRect);
        //            }
        //        };

        //        vLink.ExportToPdf(pFilename);
        //        */
        //    });
        //    await vTask;
        //}
        public async Task CreatePDFAsync(Bitmap pBitmap, string pTitle, Image pLogo, string pFilename)
        {
            var vTask = Task.Run(() =>
            {
                LinkBase vLink = new Link(new PrintingSystem());
                vLink.MinMargins = new Margins(0, 0, 0, 0);
                vLink.Margins = Setup.Margins;
                vLink.PaperKind = PaperKind.Custom;
                vLink.CustomPaperSize = new System.Drawing.Size((int)(Setup.PaperSize.Width * 1000.0 / 0.254), (int)(Setup.PaperSize.Height * 1000.0 / 0.254));
                vLink.PaperName = Setup.PaperSize.Name;

                vLink.CreateDetailArea += (s, e) =>
                {
                    ImageBrick vBrick = new ImageBrick(new BrickStyle(BorderSide.None, 0f, Color.Empty, Color.Empty, Color.Empty, this.Font, null));
                    vBrick.Image = pBitmap;
                    vBrick.SizeMode = ImageSizeMode.ZoomImage;
                    vBrick.Separable = false;
                    vBrick.NoClip = false;

                    var vDocumentUnitsFactor = 1000.0f / 0.254f;
                    float vWidth = (float)(Setup.PaperSize.Width - (Setup.Margins.Left + Setup.Margins.Right) * 0.254 / 1000.0);// -100;
                    float vHeight = (float)(Setup.PaperSize.Height - (Setup.Margins.Top + Setup.Margins.Bottom) * 0.254 / 1000.0);// -100;
                    var vRect = new RectangleF(0f, 0f, vWidth * vDocumentUnitsFactor * 0.958f, vHeight * vDocumentUnitsFactor * 0.958f); //vIndex[0] * vBitmap.Width, vIndex[1] * vBitmap.Height, vBitmap.Width, vBitmap.Height);

                    e.Graph.DrawBrick(vBrick, vRect);

                    if (!string.IsNullOrEmpty(pTitle))
                    {
                        TextBrick vTitle = new TextBrick(BorderSide.All, 1f, Color.Black, Color.FromArgb(200, Color.White), Color.Red);
                        vTitle.Font = new Font("Arial", 14f);
                        vTitle.Location = new PointF(0f, 0f);
                        vTitle.Text = pTitle;
                        vTitle.Padding = new PaddingInfo(5, 0, 5, 0, 100);
                        var vStringSize = e.Graph.MeasureString(pTitle, vTitle.Font);
                        vTitle.Rect = new RectangleF(30f, 25f, vStringSize.Width + 10, vStringSize.Height + 8);
                        e.Graph.DrawBrick(vTitle);
                    }

                    if (pLogo != null)
                    {
                        ImageBrick vLogoBrick = new ImageBrick(new BrickStyle(BorderSide.All, 2f, Color.Black, Color.White, Color.Empty, this.Font, null));
                        vLogoBrick.Image = pLogo;
                        vLogoBrick.SizeMode = ImageSizeMode.ZoomImage;
                        vLogoBrick.Separable = false;
                        vLogoBrick.NoClip = false;
                        var vLogoSize = new SizeF(pLogo.Width / 2, pLogo.Height / 2);
                        RectangleF vLogoRect = new RectangleF(vRect.Right - vLogoSize.Width - 30, vRect.Height - vLogoSize.Height - 20, vLogoSize.Width, vLogoSize.Height);
                        e.Graph.DrawBrick(vLogoBrick, vLogoRect);
                    }
                };

                vLink.ExportToPdf(pFilename);
            });
            await vTask;
        }
        public Task CreatePDFWithPdfSharpAsync(Bitmap pBitmap, string pTitle, Image pLogo, Stream pStream)
        {
            return Task.Run(() =>
            {
                XSize size = PageSizeConverter.ToSize(PdfSharp.PageSize.A4);

                var vPdf = new PdfDocument();
                var vPage = vPdf.AddPage();

                vPage.Width = XUnit.FromMillimeter(Setup.PaperSize.Width * 1000) - XUnit.FromMillimeter(Setup.Margins.Left * 0.254) - XUnit.FromMillimeter(Setup.Margins.Right * 0.254);
                vPage.Height = XUnit.FromMillimeter(Setup.PaperSize.Height * 1000) - XUnit.FromMillimeter(Setup.Margins.Top * 0.254) - XUnit.FromMillimeter(Setup.Margins.Bottom * 0.254);

                vPage.TrimMargins.Left = XUnit.FromMillimeter(Setup.Margins.Left * 0.254);
                vPage.TrimMargins.Right = XUnit.FromMillimeter(Setup.Margins.Right * 0.254);
                vPage.TrimMargins.Top = XUnit.FromMillimeter(Setup.Margins.Top * 0.254);
                vPage.TrimMargins.Bottom = XUnit.FromMillimeter(Setup.Margins.Bottom * 0.254);

                var vGraphics = XGraphics.FromPdfPage(vPage);

                var vState = vGraphics.Save();
                var vImage = XImage.FromGdiPlusImage(pBitmap);
                vGraphics.DrawImage(vImage, 0, 0, vPage.Width, vPage.Height);
                vGraphics.Restore(vState);

                if (!string.IsNullOrEmpty(pTitle))
                {
                    vState = vGraphics.Save();
                    var vFont = new XFont(this.Font.Name, this.Font.Size);
                    var vFontSize = vGraphics.MeasureString(pTitle, vFont);
                    vFontSize = new XSize(vFontSize.Width + 2, vFontSize.Height + 2);
                    var vFontRectangle = new XRect(new XPoint(15, 24 - vFontSize.Height), vFontSize);
                    vGraphics.DrawRectangle(new PdfSharp.Drawing.XSolidBrush(XColors.White), vFontRectangle);
                    vGraphics.DrawString(pTitle, vFont, XBrushes.Black, 16, 20);
                    vGraphics.DrawRectangle(XPens.Black, vFontRectangle);
                    vGraphics.Restore(vState);
                }

                if (pLogo != null)
                {
                    var vLogoImage = XImage.FromGdiPlusImage(pLogo);
                    var vImageSize = new XSize(vLogoImage.PointWidth / 2.0, vLogoImage.PointHeight / 2);
                    var vLogoRect = new XRect(vPage.Width - vImageSize.Width - 20, vPage.Height - vImageSize.Height - 15, vImageSize.Width, vImageSize.Height);
                    vGraphics.DrawImage(vLogoImage, vLogoRect);
                    vGraphics.DrawRectangle(XPens.Black, vLogoRect);
                }
                
                vPdf.Save(pStream);
            });
                /*
                var vTask = Task.Run(() =>
                {
                    LinkBase vLink = new Link(new PrintingSystem());
                    vLink.MinMargins = new Margins(0, 0, 0, 0);
                    vLink.Margins = Setup.Margins;
                    vLink.PaperKind = PaperKind.Custom;
                    vLink.CustomPaperSize = new System.Drawing.Size((int)(Setup.PaperSize.Width * 1000.0 / 0.254), (int)(Setup.PaperSize.Height * 1000.0 / 0.254));
                    vLink.PaperName = Setup.PaperSize.Name;

                    vLink.CreateDetailArea += (s, e) =>
                    {
                        ImageBrick vBrick = new ImageBrick(new BrickStyle(BorderSide.None, 0f, Color.Empty, Color.Empty, Color.Empty, this.Font, null));
                        vBrick.Image = pBitmap;
                        vBrick.SizeMode = ImageSizeMode.ZoomImage;
                        vBrick.Separable = false;
                        vBrick.NoClip = false;

                        var vDocumentUnitsFactor = 1000.0f / 0.254f;
                        float vWidth = (float)(Setup.PaperSize.Width - (Setup.Margins.Left + Setup.Margins.Right) * 0.254 / 1000.0);// -100;
                        float vHeight = (float)(Setup.PaperSize.Height - (Setup.Margins.Top + Setup.Margins.Bottom) * 0.254 / 1000.0);// -100;
                        var vRect = new RectangleF(0f, 0f, vWidth * vDocumentUnitsFactor * 0.958f, vHeight * vDocumentUnitsFactor * 0.958f); //vIndex[0] * vBitmap.Width, vIndex[1] * vBitmap.Height, vBitmap.Width, vBitmap.Height);

                        e.Graph.DrawBrick(vBrick, vRect);

                        if (!string.IsNullOrEmpty(pTitle))
                        {
                            TextBrick vTitle = new TextBrick(BorderSide.All, 1f, Color.Black, Color.FromArgb(200, Color.White), Color.Red);
                            vTitle.Font = new Font("Arial", 14f);
                            vTitle.Location = new PointF(0f, 0f);
                            vTitle.Text = pTitle;
                            vTitle.Padding = new PaddingInfo(5, 0, 5, 0, 100);
                            var vStringSize = e.Graph.MeasureString(pTitle, vTitle.Font);
                            vTitle.Rect = new RectangleF(30f, 25f, vStringSize.Width + 10, vStringSize.Height + 8);
                            e.Graph.DrawBrick(vTitle);
                        }

                        if (pLogo != null)
                        {
                            ImageBrick vLogoBrick = new ImageBrick(new BrickStyle(BorderSide.All, 2f, Color.Black, Color.White, Color.Empty, this.Font, null));
                            vLogoBrick.Image = pLogo;
                            vLogoBrick.SizeMode = ImageSizeMode.ZoomImage;
                            vLogoBrick.Separable = false;
                            vLogoBrick.NoClip = false;
                            var vLogoSize = new SizeF(pLogo.Width / 2, pLogo.Height / 2);
                            RectangleF vLogoRect = new RectangleF(vRect.Right - vLogoSize.Width - 30, vRect.Height - vLogoSize.Height - 20, vLogoSize.Width, vLogoSize.Height);
                            e.Graph.DrawBrick(vLogoBrick, vLogoRect);
                        }
                    };

                    vLink.ExportToPdf(pFilename);
                });
                await vTask;
                */
            }
        private List<string> gDownloadList = new List<string>();

        private async Task DownloadAllImagesAsync(UtmBounds pBounds)
        {
            Dictionary<Task<WebResponse>, string> vDownloadTasks = new Dictionary<Task<WebResponse>, string>();
            List<string> vFilesToDownload = new List<string>();
            TaskFactory vTaskFactory = new TaskFactory();
            var vStart = Setup.GetStart(pBounds);
           
            for (double x = vStart.Easting; x <= pBounds.SouthEast.Easting; x += Setup.TileSizeInMeters)
            {
                for (double y = vStart.Northing; y <= pBounds.NorthWest.Northing + Setup.TileSizeInMeters; y += Setup.TileSizeInMeters)
                {
                    UtmPosition vImagePosition = new UtmPosition(x, y);
                    string vFilename = GetFilename(vImagePosition, Setup.TileSizeInMeters, Setup.Map.TileSize);

                    if (!File.Exists(vFilename) && !gDownloadList.Contains(vFilename))
                    {
                        gDownloadList.Add(vFilename);
                        CancellationTokenSource vCancellationSource = new CancellationTokenSource();
                        CancellationToken vCancellationToken = vCancellationSource.Token;
                        System.Net.WebRequest vRequest = WebRequest.Create(Setup.Map.GetUrl(x, y - Setup.TileSizeInMeters, x + Setup.TileSizeInMeters, y));
                        vDownloadTasks.Add(Task<WebResponse>.Factory.FromAsync(vRequest.BeginGetResponse, vRequest.EndGetResponse, vRequest), vFilename);
                    }
                }
            }

            // Remove any incomplete task, which is not a part of this batch
            //var vTasksToCancel = gDownloadList.Where(v => !vFilesToDownload.Contains(v.Key));
            //foreach (var vTask in vTasksToCancel.ToArray())
            //{
            //    if (!vTask.Value.IsCancellationRequested)
            //    {
            //        vTask.Value.Cancel();
            //        vTask.Value.Dispose();
            //        gDownloadList.Remove(vTask.Key);
            //    }
            //}

            int vTotalFiles = gDownloadList.Count;

            while (vDownloadTasks.Count > 0)
            {
                var vCompleted = await Task.WhenAny(vDownloadTasks.Keys);
                var vFilename = vDownloadTasks[vCompleted];
                vDownloadTasks.Remove(vCompleted);
                
                if (vCompleted.Status == TaskStatus.RanToCompletion && vCompleted.Result != null)
                {
                    if (!File.Exists(vFilename))
                    {
                        using (var vFile = File.OpenWrite(vFilename))
                        {
                            using (var vResponse = vCompleted.Result.GetResponseStream())
                            {
                                await vResponse.CopyToAsync(vFile);
                                vResponse.Close();
                                vFile.Close();
                            }
                        }
                    }
                }

                gDownloadList.Remove(vFilename);
                OnDownloadProgress(vTotalFiles, vTotalFiles - gDownloadList.Count);
            }
        }

        public async Task<Bitmap> CreateBitmapAsync(UtmBounds pBounds)
        {
            await DownloadAllImagesAsync(pBounds); // new UtmBounds(OrigoUtm33, BottomRigthUtm33));

            var vResult = await Task<Bitmap>.Run(() =>
            {
                var vImageSize = new Size((int)((BottomRigthUtm33.Easting - OrigoUtm33.Easting + Setup.TileSizeInMeters) * Setup.PixelsPerMeter), (int)((OrigoUtm33.Northing - BottomRigthUtm33.Northing) * Setup.PixelsPerMeter)); // GetImageSize();
                Bitmap vBitmap = new Bitmap(vImageSize.Width, vImageSize.Height);
                Graphics vGraphics = Graphics.FromImage(vBitmap);
                vGraphics.InterpolationMode = System.Drawing.Drawing2D.InterpolationMode.HighQualityBicubic;
                vGraphics.CompositingQuality = System.Drawing.Drawing2D.CompositingQuality.HighQuality;
                vGraphics.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.AntiAlias;
                DrawMap(vGraphics);
                vGraphics.Dispose();

                var vRescaledSize = GetImageSize();
                Bitmap vRescaledBitmap = new Bitmap(vRescaledSize.Width, vRescaledSize.Height);
                Graphics vRescaledGraphics = Graphics.FromImage(vRescaledBitmap);
                vRescaledGraphics.InterpolationMode = System.Drawing.Drawing2D.InterpolationMode.HighQualityBicubic;
                vRescaledGraphics.CompositingQuality = System.Drawing.Drawing2D.CompositingQuality.HighQuality;
                vRescaledGraphics.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.AntiAlias;
                vRescaledGraphics.TextRenderingHint = System.Drawing.Text.TextRenderingHint.ClearTypeGridFit;

                var vCenterUtm33 = PositionUtm32.Transform(32, 33);

                var vNewOrigo = vCenterUtm33.Move(-vRescaledSize.Width / Setup.PixelsPerMeter / 2.0, vRescaledSize.Height / Setup.PixelsPerMeter / 2.0);
                var vNewBottomRight = vCenterUtm33.Move(vRescaledSize.Width / Setup.PixelsPerMeter / 2.0, -vRescaledSize.Height / Setup.PixelsPerMeter / 2.0);
                var vOffset = Utm33ToBitmapPosition(vNewOrigo, OrigoUtm33);
                vRescaledGraphics.DrawImage(vBitmap, -vOffset.X, -vOffset.Y);
                vBitmap.Dispose();

                SizeF vLabelRectSizeUtm = new SizeF((float)(Setup.PixelsPerMeter * 30.0 * Setup.ScaleAndTileSize.Scale / 5000.0), (float)(Setup.PixelsPerMeter * 20.0 * Setup.ScaleAndTileSize.Scale / 5000.0));
                SizeF vLabelRectSizeLatLong = new SizeF((float)(Setup.PixelsPerMeter * 40.0 * Setup.ScaleAndTileSize.Scale / 5000.0), (float)(Setup.PixelsPerMeter * 20.0 * Setup.ScaleAndTileSize.Scale / 5000.0));

                if (Setup.ShowUtmGrid)
                    DrawUtmGrid(vRescaledGraphics, vNewOrigo, vNewBottomRight, 1F, vLabelRectSizeUtm);
                if (Setup.ShowLatLonGrid)
                    DrawLatLongGrid(vRescaledGraphics, vNewOrigo, vNewBottomRight, 1F, vLabelRectSizeLatLong);

                var vNewCenter = new UtmPosition(vNewOrigo.Easting + (vNewBottomRight.Easting - vNewOrigo.Easting) / 2.0, vNewBottomRight.Northing + (vNewOrigo.Northing - vNewBottomRight.Northing) / 2.0);

                if (Setup.RadiusR25.HasValue)
                    DrawRadius(vRescaledGraphics, vNewCenter, vNewOrigo, Setup.RadiusR25.Value, 1f);
                if (Setup.RadiusR50.HasValue)
                    DrawRadius(vRescaledGraphics, vNewCenter, vNewOrigo, Setup.RadiusR50.Value, 1f);

                if (Setup.ShowCrossHair)
                {
                    DrawCrossHair(vRescaledGraphics, vNewCenter, vNewOrigo, 1f);
                }

                vRescaledGraphics.DrawRectangle(Pens.Black, 0f, 0f, vRescaledSize.Width - 1f, vRescaledSize.Height - 1f);

                return vRescaledBitmap;

            });

            return vResult;
        }



        private void DrawMap(Graphics vGraphics, float pPreviewZoom, UtmBounds pBounds)
        {
            var vStart = Setup.GetStart(pBounds);
           
            int vTotalCount = Setup.CountTiles(pBounds);
            int vProcessed = 0;

            for (double x = vStart.Easting; x <= pBounds.SouthEast.Easting + Setup.TileSizeInMeters; x += Setup.TileSizeInMeters)
            {
                for (double y = vStart.Northing; y <= pBounds.NorthWest.Northing + Setup.TileSizeInMeters; y += Setup.TileSizeInMeters)
                {
                    UtmPosition vImagePosition = new UtmPosition(x, y);
                    var vLocationInBitmap = Utm33ToBitmapPosition(vImagePosition, pBounds.NorthWest);
                    string vFilename = GetFilename(vImagePosition, Setup.TileSizeInMeters, Setup.Map.TileSize);

                    if (File.Exists(vFilename))
                    {
                        try
                        {
                            using (Bitmap vTile = new Bitmap(vFilename))
                            {
                                vGraphics.DrawImage(vTile, (int)(vLocationInBitmap.X / pPreviewZoom), (int)(vLocationInBitmap.Y / pPreviewZoom), (int)(vTile.Width / pPreviewZoom), (int)(vTile.Height / pPreviewZoom));
                            }
                        }
                        catch (ArgumentException ex)
                        {
                            try
                            {
                                File.Delete(vFilename);
                            }
                            catch { }
                        }
                    }

                    OnCreateBitmapProgress(vTotalCount, ++vProcessed);
                }
            }
        }

    

        private void DrawMap(Graphics vGraphics)
        {
            DrawMap(vGraphics, 1f, new UtmBounds(OrigoUtm33, BottomRigthUtm33));
        }
    }
}
