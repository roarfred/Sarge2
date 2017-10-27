using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Sarge.Maps
{
    public static class WebClientExtensions
    {
        public static async Task<byte[]> DownloadDataTaskAsync(this WebClient webClient, Uri address, CancellationToken cancellationToken)
        {
            cancellationToken.ThrowIfCancellationRequested();

            using (cancellationToken.Register(webClient.CancelAsync))
            {
                try
                {
                    return await webClient.DownloadDataTaskAsync(address);
                }
                catch (Exception ex)
                {
                    return null;
                }
            }
        }
    }
}
