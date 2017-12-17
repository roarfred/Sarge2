using Microsoft.AspNetCore.Mvc;
using Sarge.Maps.PoiSymbols;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Sarge2.Api.Controllers
{
    [Route("api/[controller]")]
    public class SymbolsController : Controller
    {
        [HttpGet]
        public string[] GetSymbolNames()
        {
            return PoiSymbols.GetSymbolNames();
        }

        [HttpGet("{name}")]
        public ActionResult GetSymbol(string name)
        {
            var symbol = PoiSymbols.GetSymbol(name);
            if (symbol == null)
                return File(PoiSymbols.GetDefaultSymbol(), "image/png");
            else
                return File(symbol, "image/png");
        }
    }
}
