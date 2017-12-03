using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Xunit;

namespace Sarge.Maps.Tests
{
    public class PoiSymbolsTests
    {
        [Theory]
        [InlineData("Bank")]
        [InlineData("Bell")]
        [InlineData("Building")]
        [InlineData("Red Cross")]
        public void PoiSymbols_ShouldHaveImageFor(string symbol)
        {
            var data = Sarge.Maps.PoiSymbols.PoiSymbols.GetSymbol(symbol);
            Assert.NotNull(data);
        }
    }
}
