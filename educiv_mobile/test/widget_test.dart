import 'package:flutter_test/flutter_test.dart';
import 'package:educiv_mobile/main.dart';

void main() {
  testWidgets('App should render', (WidgetTester tester) async {
    await tester.pumpWidget(const EduCIVApp());
    expect(find.text('EduCIV'), findsOneWidget);
  });
}
