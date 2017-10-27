using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sarge.Maps
{
    public class MapDownloadProgressEventArgs : EventArgs
    {
        public int TotalFiles { get; set; }
        public int Downloaded { get; set; }
        public float Progress
        {
            get
            {
                return (float)Downloaded / (float)TotalFiles;
            }
        }
    }
}
