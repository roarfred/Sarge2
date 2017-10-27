namespace Sarge.Maps
{
    public class CreateBitmapProgressEventArgs
    {
        public int TotalFiles { get; set; }
        public int Processed { get; set; }
        public float Progress
        {
            get
            {
                return (float)Processed / (float)TotalFiles;
            }
        }
    }
}