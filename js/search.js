function myFunction() {
  // Declare variables
  var input, filter, ul, li, a, i, txtValue;
  faculty = $("#faculty-select").val();
  filter = $("#course-search").val().toUpperCase();
  li = $("#courses-list").find('li');

  // Loop through all list items, and hide those who don't match the search query
  li.each(function(index) {
    a = $(this).find("a").first();
    txtValue = a.text();
    num = txtValue.split('-')[0].trimEnd();
    if (txtValue.toUpperCase().indexOf(filter) > -1 && (faculty === '00' || num.startsWith(faculty))) {
        $(this).css("display", "");
    } else {
        $(this).css("display", "none");
    }
  });
}

$( document ).ready(function() {
    $.ajax({ url: 'https://michael-maltsev.github.io/technion-histograms/', success: function(data) { 
            html = $(data)
            ul = $("#courses-list");
            html.find("a").each(function(index) {
                full_name = $(this).text();
                num = full_name.split('-')[0].trimEnd();
                ul.append(`<li><a href="course.html?number=${num}">${full_name}</a></li>`);
            });
        } 
    });
    $("#faculty-select").change(function() {
        myFunction();
    })
});
