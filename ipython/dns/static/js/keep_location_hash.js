$('#main-menu a').on('click', function (e)
{
    e.preventDefault();

  if ($(this).hasClass('app_link'))
  {
    window.location = $(e.target).attr('href') + window.location.hash;
  }
  else
  {
    var url, urlParts;

    url = $(e.target).attr('href');
    urlParts = window.location.hash.substr(1).split('|');

    if (urlParts.length>0)
    {
      urlParts = urlParts[0].split('=');
      urlParts.length>1 && (url += '?dataDate=' + urlParts[1]);
    }

    window.location = url;
  }
});
