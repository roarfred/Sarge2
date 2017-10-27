using System;
using System.Collections.Generic;
using System.Drawing.Printing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sarge.Maps
{
    public class PaperSize
    {
        public string Name { get; set; }
        public PaperKind PaperKind { get; set; }
        public float Width { get; set; }
        public float Height { get; set; }

        public override string ToString()
        {
            return string.Format("{0} ({1:0.00} x {2:0.00} cm", Name, Width * 100.0, Height * 100.0);
        }

        public static IEnumerable<PaperSize> CreatePaperSizes()
        {
            double vWidth = 2.3780 / 2.0; //  Math.Sqrt(Math.Sqrt(2.0));
            double vHeight = 1.6820 / 2.0; // vWidth / Math.Sqrt(2.0);

            for (int i = 0; i < 6; i++)
            {
                yield return new PaperSize() { Name = "A" + i.ToString() + " Landscape", Height = (float)vHeight, Width = (float)vWidth };
                yield return new PaperSize() { Name = "A" + i.ToString() + " Portrait", Height = (float)vWidth, Width = (float)vHeight };

                vWidth /= Math.Sqrt(2);
                vHeight /= Math.Sqrt(2);
            }
        }
    }
}
