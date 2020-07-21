// Read a page's GET URL variables and return them as an associative array.
function getUrlVars()
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

function getSemesterFromCode(code)
{
    year = parseInt(code.substr(0, 4), 10);
    type = code.substr(4);
    if(type == '01') {
        return 'חורף ' + year + '-' + (year + 1);
    } else if(type == '02') {
        return 'אביב ' + (year + 1);
    } else if(type == '03') {
        return 'קיץ ' + (year + 1);
    }

}

function getStaffHTML(staff)
{
    html = '<div><h4>סגל:</h4>';
    $.each(staff, function(key, val) {
       html += `<label>${val['name']} (${val['title']})</label>`;
       html += '</br>';
    });
    html += '</div>'
    return html;
}

function getGradesHTML(course_num, semester, type, json)
{
    html = '<span>'
    html += `<p><img src="https://michael-maltsev.github.io/technion-histograms/${course_num}/${semester}/${type}.png" alt="${semester} ${type}"></p>`;
    html += '<p><table>';
    html += '<thead><tr><th>סטודנטים</th><th>עברו/נכשלו</th><th>אחוז עוברים</th><th>ציון מינימלי</th><th>ציון מקסימלי</th><th>ממוצע</th><th>חציון</th></tr></thead>';
    html += '<tbody><tr>';
    html += `<td>${json['students']}</td>`;
    html += `<td>${json['passFail']}</td>`;
    html += `<td>${json['passPercent']}</td>`;
    html += `<td>${json['min']}</td>`;
    html += `<td>${json['max']}</td>`;
    html += `<td>${json['average']}</td>`;
    html += `<td>${json['median']}</td>`;
    html += '</tr></tbody>';
    html += '</table></p>';
    html += '</span>';
    return html;
}

function getTypeHebrew(key)
{
    if(key === 'Exam_A') {
        return "מבחן מועד א'";
    } else if(key === 'Exam_B') {
        return "מבחן מועד ב'"
    } else if(key === 'Final_A') {
        return "סופי מועד א'";
    } else if(key === 'Final_B') {
        return "סופי מועד ב'";
    } else if(key === 'Finals') {
        return "סופי";
    }
}

function getCourseData(course_num, semester, json)
{
    div = $("<div></div>");
    div.append(getStaffHTML(json['Staff']));
    div.append('<h4>היסטוגרמה:</h4>')
    sel = $('<select style="width:100%;"></sel>');
    $.each(json, function(key, val) {
       if(key !== 'Staff') {
        sel.append(`<option value="${key}">${getTypeHebrew(key)}</option>`);
        }
    });
    sel.data("prev",sel.val())
    sel.change(function() {
        val = $(this).val();
        prev = $(this).data("prev");
        $(this).data("prev",val);
        parent = $(this).parent().parent();
        prev_div = parent.find(`div[name='${prev}']`);
        new_div = parent.find(`div[name='${val}']`);
        prev_div.css('display', 'none');
        new_div.css('display', 'block');
    });
    $('<p></p>').append(sel).appendTo(div);
    $.each(json, function(key, val) {
       if(key !== 'Staff') {
            html = `<div class="exam-data" name=${key}>`;
            html += getGradesHTML(course_num, semester, key, val);
            html += '</div>';
            div.append(html);
        }
    });
    new_div = div.find(`div[name='${sel.val()}']`).css('display', 'block');;
    return div;
}

function getCourseAverage(course_data)
{
    sum = 0;
    count = 0;
    $.each( course_data, function( key, val ) {
        if(val['Finals'] !== undefined) {
            sum += parseFloat(val['Finals']['average']);
            count++;
        } else if(val['Final_A'] !== undefined) {
            sum += parseFloat(val['Final_A']['average']);
            count++;
        }
    });
    if(count == 0) {
        return 0;
    }
    return (sum/count).toFixed(3);
}

$( document ).ready(function() {
    course_num = getUrlVars()['number'];
    $('#course-title').text(course_num);
    $.getJSON(`https://michael-maltsev.github.io/technion-histograms/${course_num}/index.min.json`, function(data) {
        $('#course-average').text(getCourseAverage(data));
        ul = $('#semesters-list');
        $.each( data, function( key, val ) {
            li = $('<li></li>')
            button = $(`<button type="button" class="collapsible">${getSemesterFromCode(key)}</button>`);
            
            button.click(function() {
                $(this).toggleClass('active');
                content = $(this).siblings('div.semester-content').first();
                if(content.css('display') === 'block') {
                    content.css('display', 'none');
                } else {
                    content.css('display', 'block');
                }
            })

            button.appendTo(li);
            course_div = $('<div class="semester-content"></div>')
            course_div.append(getCourseData(course_num, key, val));
            li.append(course_div);
            li.appendTo(ul);
        });
    });
});