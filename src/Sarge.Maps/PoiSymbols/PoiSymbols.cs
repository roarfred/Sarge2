using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace Sarge.Maps.PoiSymbols
{
    public class PoiSymbols
    {
        private const string PREFIX = "Sarge.Maps.PoiSymbols.png_16.";
        private const string SUFFIX = ".png";

        public static string[] GetSymbolNames()
        {
            var names = Assembly.GetExecutingAssembly().GetManifestResourceNames();
            return names.Where(n => n.StartsWith(PREFIX) && n.EndsWith(SUFFIX)).Select(n => n.Substring(PREFIX.Length, n.Length - PREFIX.Length - SUFFIX.Length)).ToArray();
        }
        public static Stream GetSymbol(string name)
        {
            return Assembly.GetExecutingAssembly().GetManifestResourceStream($"{PREFIX}{name}{SUFFIX}");
        }
        public static Stream GetDefaultSymbol()
        {
            return GetSymbol("Default");
        }
    }
}
