using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sarge.Maps
{
    public class Margins
    {
        public Margins()
        {
        }

        public Margins(int pLeft,  int pRight, int pTop, int pBottom)
        {
            Left = pLeft;
            Top = pTop;
            Right = pRight;
            Bottom = pBottom;
        }
        public int Left { get; set; }
        public int Top { get; set; }
        public int Right { get; set; }
        public int Bottom { get; set; }

        public static implicit operator System.Drawing.Printing.Margins(Margins m)
        {
            return new System.Drawing.Printing.Margins(m.Left, m.Right, m.Top, m.Bottom);
        }
        public static implicit operator Margins(System.Drawing.Printing.Margins m)
        {
            return new Margins(m.Left, m.Right, m.Top, m.Bottom);
        }
    }
}
