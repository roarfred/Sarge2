namespace Sarge.Maps
{
    public class UtmBounds
    {
        public UtmBounds (UtmPosition pNorthWest, UtmPosition pSouthEast)
        {
            NorthWest = pNorthWest;
            SouthEast = pSouthEast;
        }
        public UtmPosition NorthWest
        {
            get;
            set;
        }
        public UtmPosition SouthEast
        {
            get;
            set;
        }
    }
}