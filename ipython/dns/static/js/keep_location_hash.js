$('#main-menu a').on('click', function (e)
{
    e.preventDefault();

    window.location = $(e.target).attr('href') + window.location.hash;
});
